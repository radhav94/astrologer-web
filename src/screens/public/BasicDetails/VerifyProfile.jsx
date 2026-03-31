import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep, clearRegisterData } from "../../../reducer/registerSlice";
import { createFileValidation } from "../../../utils/utils";
import { useFileUpload } from "../../../hooks/useFileUpload";
import { useRegisterAstrologerMutation } from "../../../redux/register/registerAstroApi";
import { Toast } from "../../../components";
import Button from "../../../components/UI/button/Button";
import FormStep from "./FormStep";
import FileUploadInput from "../../../components/UI/fileUploadInput/FileUploadInput";
import styles from "./BasicForms.module.scss";

const VerifyProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { uploadFile } = useFileUpload();
  const [registerAstrologer, { isLoading: isRegistering }] = useRegisterAstrologerMutation();
  const registerData = useSelector((state) => state.register.registerData);
  
  // Strip KYC details from the payload — KYC is verified separately
  const KYC_FIELDS = [
    "kycVerified",
    "kycMethod",
    "kycAadhaarNumber",
    "kycAadhaarName",
    "kycAadhaarDob",
    "kycPanNumber",
    "kycPanName",
    "kycPanDob",
  ];

  const getRegisterPayload = () => {
    if (!registerData) return {};
    const payload = { ...registerData };
    KYC_FIELDS.forEach((field) => delete payload[field]);
    return payload;
  };

  const [uploading, setUploading] = useState({
    profileImgUrl: false,
  });

  const validationSchema = Yup.object().shape({
    profileImgUrl: createFileValidation({
      fieldName: "Profile photo",
      required: true,
    }),
  });

  const formik = useFormik({
    initialValues: {
      profileImgUrl: registerData?.profileImgUrl || "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: async () => {
      try {  
        await registerAstrologer(getRegisterPayload()).unwrap();
        Toast.success("Registration successful!");
        dispatch(clearRegisterData());
        navigate("/verificationpending");
      } catch (error) {
        console.error("Registration error:", error);
        Toast.error(error?.data?.message || "Registration failed. Please try again.");
      }
    },
  });

  useEffect(() => {
    formik.validateForm();
  }, [formik.values.profileImgUrl]);

  const handleFileUpload = async (fieldName, acceptTypes = "image/*,.pdf") => {
    try {
      setUploading((prev) => ({ ...prev, [fieldName]: true }));
      const fileUrl = await uploadFile(acceptTypes);

      if (fileUrl) {
        await formik.setFieldValue(fieldName, fileUrl, false);
        await formik.setFieldTouched(fieldName, true, false);
        await formik.validateForm();

        dispatch(updateRegisterData({ [fieldName]: fileUrl }));
        dispatch(setCurrentStep(8));
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSkip = async () => {
    try {
      await registerAstrologer(getRegisterPayload()).unwrap();
      Toast.success("Registration successful!");
      dispatch(clearRegisterData());
      navigate("/verificationpending");
    } catch (error) {
      console.error("Registration error:", error);
      Toast.error(error?.data?.message || "Registration failed. Please try again.");
    }
  };

  const isFormValid = 
    formik.values.profileImgUrl !== "" &&
    Object.keys(formik.errors).length === 0;

  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>
          <div className={styles.progressWithSkip}>
            <FormStep totalSteps={8} currentStep={8} />
            <button 
              type="button"
              onClick={handleSkip}
              disabled={isRegistering}
              className={styles.skipButton}
            >
              Skip for Now
            </button>
          </div>

          <h1 className={styles.heading}>Verify Your Profile</h1>
          <p className={styles.subheading}>
            Upload your profile photo to complete registration.
            Verified astrologers gain more visibility and trust from clients.
          </p>

          <FileUploadInput
            label="Profile Photo"
            optionalText=""
            accept="image/*"
            value={formik.values.profileImgUrl}
            isUploading={uploading.profileImgUrl}
            onUpload={() => handleFileUpload("profileImgUrl", "image/*")}
            uploadText="Tap here to add file"
            uploadSubtext="(.jpg, .png)"
          />
        </div>

        <div className={styles.formLayoutFooter}>
          <Button
            type="submit"
            onClick={formik.handleSubmit}
            disabled={!isFormValid || formik.isSubmitting || isRegistering}
            className={`${styles.formButton} ${
              !isFormValid || formik.isSubmitting || isRegistering
                ? styles.formButtonDisabled
                : ""
            }`}
          >
            {isRegistering ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyProfile;
