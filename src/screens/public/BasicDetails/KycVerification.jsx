import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import {
  useGenerateAadhaarOtpMutation,
  useVerifyAadhaarOtpMutation,
  useVerifyPanMutation,
} from "../../../redux/kyc/kycApi";
import { Toast } from "../../../components";
import Button from "../../../components/UI/button/Button";
import FormStep from "./FormStep";
import styles from "./BasicForms.module.scss";

const OTP_LENGTH = 6;
const AADHAAR_LENGTH = 12;
const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;

const KYC_METHODS = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
];

/** Convert YYYY-MM-DD → DD-MM-YYYY (Aadhaar API format) */
const formatDobForAadhaar = (dob) => {
  if (!dob) return "";
  const [y, m, d] = dob.split("-");
  return `${d}-${m}-${y}`;
};

const KycVerification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerData = useSelector((state) => state.register.registerData);

  const fullName = [registerData?.firstName, registerData?.lastName]
    .filter(Boolean)
    .join(" ");
  const rawDob = registerData?.dateOfBirth || "";

  const isKycVerified = registerData?.kycVerified === true;
  const verifiedMethod = registerData?.kycMethod || null;

  const [method, setMethod] = useState(verifiedMethod || "aadhaar");

  // Aadhaar state
  const [aadhaarNumber, setAadhaarNumber] = useState(registerData?.kycAadhaarNumber || "");
  const [aadhaarName, setAadhaarName] = useState(registerData?.kycAadhaarName || fullName);
  const [aadhaarDob, setAadhaarDob] = useState(registerData?.kycAadhaarDob || rawDob);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [kycRecordId, setKycRecordId] = useState(null);
  const otpRefs = useRef([]);

  // PAN state
  const [panNumber, setPanNumber] = useState(registerData?.kycPanNumber || "");
  const [panName, setPanName] = useState(registerData?.kycPanName || fullName);
  const [panDob, setPanDob] = useState(registerData?.kycPanDob || rawDob);

  // API hooks
  const [generateOtp, { isLoading: isGenerating }] = useGenerateAadhaarOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyAadhaarOtpMutation();
  const [verifyPan, { isLoading: isVerifyingPan }] = useVerifyPanMutation();

  const navigateToNextStep = useCallback(() => {
    dispatch(setCurrentStep(8));
    navigate("/verifyprofile");
  }, [dispatch, navigate]);

  /* ========== Aadhaar Handlers ========== */
  const handleGenerateOtp = useCallback(async () => {
    if (aadhaarNumber.length !== AADHAAR_LENGTH) {
      Toast.error("Enter a valid 12-digit Aadhaar number");
      return;
    }
    try {
      const res = await generateOtp({
        aadhaar_number: aadhaarNumber,
        name: aadhaarName,
        dob: formatDobForAadhaar(aadhaarDob),
      }).unwrap();
      setKycRecordId(res?.data?.kycRecordId);
      setOtpSent(true);
      Toast.success("OTP sent to Aadhaar-linked mobile");
    } catch (err) {
      Toast.error(err?.data?.message || "Failed to send OTP");
    }
  }, [aadhaarNumber, aadhaarName, aadhaarDob, generateOtp]);

  const handleOtpChange = useCallback((index, value) => {
    if (!/^\d?$/.test(value)) return;
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleVerifyOtp = useCallback(async () => {
    const otpStr = otp.join("");
    if (otpStr.length !== OTP_LENGTH) {
      Toast.error("Enter the complete OTP");
      return;
    }
    try {
      await verifyOtp({ kyc_record_id: kycRecordId, otp: otpStr }).unwrap();
      Toast.success("Aadhaar verified successfully");
      dispatch(updateRegisterData({
        kycVerified: true,
        kycMethod: "aadhaar",
        kycAadhaarNumber: aadhaarNumber,
        kycAadhaarName: aadhaarName,
        kycAadhaarDob: aadhaarDob,
      }));
    } catch (err) {
      Toast.error(err?.data?.message || "OTP verification failed");
    }
  }, [otp, kycRecordId, verifyOtp, dispatch]);

  const handleResendOtp = useCallback(() => {
    setOtp(Array(OTP_LENGTH).fill(""));
    handleGenerateOtp();
  }, [handleGenerateOtp]);

  /* ========== PAN Handler ========== */
  const handleVerifyPan = useCallback(async () => {
    if (!PAN_REGEX.test(panNumber.toUpperCase())) {
      Toast.error("Enter a valid PAN number");
      return;
    }
    if (!panName.trim()) {
      Toast.error("Name is required");
      return;
    }
    if (!panDob) {
      Toast.error("Date of birth is required");
      return;
    }
    try {
      await verifyPan({
        pan: panNumber.toUpperCase(),
        name: panName,
        dob: panDob,
      }).unwrap();
      Toast.success("PAN verified successfully");
      dispatch(updateRegisterData({
        kycVerified: true,
        kycMethod: "pan",
        kycPanNumber: panNumber.toUpperCase(),
        kycPanName: panName,
        kycPanDob: panDob,
      }));
    } catch (err) {
      Toast.error(err?.data?.message || "PAN verification failed");
    }
  }, [panNumber, panName, panDob, verifyPan, dispatch]);

  const handleMethodChange = useCallback((value) => {
    if (isKycVerified) return;
    setMethod(value);
    setOtpSent(false);
    setOtp(Array(OTP_LENGTH).fill(""));
  }, [isKycVerified]);

  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>
          {/* Progress */}
          <FormStep totalSteps={8} currentStep={7} />

          <h1 className={styles.heading}>KYC Verification</h1>
          <p className={styles.subheading}>
            Verify your identity using Aadhaar or PAN card to complete your profile.
          </p>

          {/* Verified Banner */}
          {isKycVerified && (
            <div className={styles.verifiedBanner}>
              <span className={styles.verifiedIcon}>✓</span>
              KYC verified via {verifiedMethod === "aadhaar" ? "Aadhaar Card" : "PAN Card"}
            </div>
          )}

          {/* Radio Selection */}
          <div className={styles.radioGroup}>
            {KYC_METHODS.map(({ value, label }) => (
              <label
                key={value}
                className={`${styles.radioLabel} ${method === value ? styles.radioLabelActive : ""}`}
              >
                <input
                  type="radio"
                  name="kycMethod"
                  value={value}
                  checked={method === value}
                  onChange={() => handleMethodChange(value)}
                  disabled={isKycVerified}
                  className={styles.radioInput}
                />
                {label}
              </label>
            ))}
          </div>

          {/* ========== Aadhaar Form ========== */}
          {method === "aadhaar" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={aadhaarName}
                  onChange={(e) => setAadhaarName(e.target.value)}
                  placeholder="Enter full name"
                  className={styles.input}
                  disabled={isKycVerified}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  value={aadhaarDob}
                  onChange={(e) => setAadhaarDob(e.target.value)}
                  className={styles.dateInput}
                  disabled={isKycVerified}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Aadhaar Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={AADHAAR_LENGTH}
                  placeholder="Enter 12-digit Aadhaar number"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                  className={styles.input}
                  disabled={isKycVerified}
                />
              </div>

              {!isKycVerified && (
                <>
                  {!otpSent ? (
                    <Button
                      onClick={handleGenerateOtp}
                      disabled={aadhaarNumber.length !== AADHAAR_LENGTH || isGenerating}
                      className={`${styles.formButton} ${
                        aadhaarNumber.length !== AADHAAR_LENGTH || isGenerating ? styles.formButtonDisabled : ""
                      }`}
                    >
                      {isGenerating ? "Sending OTP..." : "Verify with OTP"}
                    </Button>
                  ) : (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Enter OTP</label>
                        <div className={styles.otpContainer}>
                          {otp.map((digit, i) => (
                            <input
                              key={i}
                              ref={(el) => (otpRefs.current[i] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              className={styles.otpInput}
                            />
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleVerifyOtp}
                        disabled={otp.join("").length !== OTP_LENGTH || isVerifying}
                        className={`${styles.formButton} ${
                          otp.join("").length !== OTP_LENGTH || isVerifying ? styles.formButtonDisabled : ""
                        }`}
                      >
                        {isVerifying ? "Verifying..." : "Verify OTP"}
                      </Button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isGenerating}
                        className={styles.resendButton}
                      >
                        {isGenerating ? "Resending..." : "Resend OTP"}
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* ========== PAN Form ========== */}
          {method === "pan" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>PAN Number</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className={`${styles.input} ${styles.uppercaseInput}`}
                  disabled={isKycVerified}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name (as on PAN)</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={panName}
                  onChange={(e) => setPanName(e.target.value)}
                  className={styles.input}
                  disabled={isKycVerified}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  value={panDob}
                  onChange={(e) => setPanDob(e.target.value)}
                  className={styles.dateInput}
                  disabled={isKycVerified}
                />
              </div>

              {!isKycVerified && (
                <Button
                  onClick={handleVerifyPan}
                  disabled={!panNumber || !panName.trim() || !panDob || isVerifyingPan}
                  className={`${styles.formButton} ${
                    !panNumber || !panName.trim() || !panDob || isVerifyingPan ? styles.formButtonDisabled : ""
                  }`}
                >
                  {isVerifyingPan ? "Verifying..." : "Verify PAN"}
                </Button>
              )}
            </>
          )}
        </div>

        {/* Next Button — always visible at bottom */}
        <div className={styles.formLayoutFooter}>
          <Button
            onClick={navigateToNextStep}
            disabled={!isKycVerified}
            className={`${styles.formButton} ${!isKycVerified ? styles.formButtonDisabled : ""}`}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KycVerification;
