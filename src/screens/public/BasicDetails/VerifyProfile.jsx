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
  
  const [uploading, setUploading] = useState({
    profileImgUrl: false,
    aadharCardImgUrl: false,
    panCardImgUrl: false,
  });

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    profileImgUrl: createFileValidation({
      fieldName: "Profile photo",
      required: true,
    }),
    aadharCardImgUrl: createFileValidation({
      fieldName: "Aadhar card",
      required: true,
    }),
    panCardImgUrl: createFileValidation({
      fieldName: "PAN card",
      required: true,
    }),
  });

  // Formik setup with Redux state hydration
  const formik = useFormik({
    initialValues: {
      profileImgUrl: registerData?.profileImgUrl || "",
      aadharCardImgUrl: registerData?.aadharCardImgUrl || "",
      panCardImgUrl: registerData?.panCardImgUrl || "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true, // Validate on mount to check initial state
    enableReinitialize: true, // Allow form to reinitialize when Redux state changes
    onSubmit: async () => {
      try {  
        await registerAstrologer(registerData).unwrap();
        
        Toast.success("Registration successful!");
        dispatch(clearRegisterData());
        navigate("/verificationpending");
      } catch (error) {
        console.error("Registration error:", error);
        Toast.error(error?.data?.message || "Registration failed. Please try again.");
      }
    },
  });

  // Re-validate form whenever values change to ensure button state is correct
  useEffect(() => {
    formik.validateForm();
  }, [formik.values.profileImgUrl, formik.values.aadharCardImgUrl, formik.values.panCardImgUrl]);

  const handleFileUpload = async (fieldName, acceptTypes = "image/*,.pdf") => {
    try {
      setUploading((prev) => ({ ...prev, [fieldName]: true }));

      // Use the custom hook to upload file
      const fileUrl = await uploadFile(acceptTypes);

      if (fileUrl) {
        // Set the uploaded file URL in Formik
        await formik.setFieldValue(fieldName, fileUrl, false);
        
        // Mark field as touched to trigger validation
        await formik.setFieldTouched(fieldName, true, false);
        
        // Manually validate the form to update errors state
        await formik.validateForm();

        // Get current form values with the new file URL
        const updatedValues = {
          ...formik.values,
          [fieldName]: fileUrl,
        };

        // Check if all files are uploaded
        if (updatedValues.profileImgUrl && updatedValues.aadharCardImgUrl && updatedValues.panCardImgUrl) {
          // Dispatch to update registerData state
          dispatch(updateRegisterData({
            profileImgUrl: updatedValues.profileImgUrl,
            aadharCardImgUrl: updatedValues.aadharCardImgUrl,
            panCardImgUrl: updatedValues.panCardImgUrl,
            
          }));

          // Update current step
          dispatch(setCurrentStep(8));
        }
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSkip = async () => {
    try {
      // Call register API with current registerData (without file uploads)
      await registerAstrologer(registerData).unwrap();
      
      Toast.success("Registration successful!");
      dispatch(clearRegisterData());
      navigate("/verificationpending");
    } catch (error) {
      console.error("Registration error:", error);
      Toast.error(error?.data?.message || "Registration failed. Please try again.");
    }
  };

  // Check if all required fields are filled and valid
  const isFormValid = 
    formik.values.profileImgUrl !== "" &&
    formik.values.aadharCardImgUrl !== "" &&
    formik.values.panCardImgUrl !== "" &&
    Object.keys(formik.errors).length === 0;

  return (
    <div className={styles.formLayoutWrapper}>
      <div className={styles.formLayoutContainer}>
        <div className={styles.formLayoutContent}>
          {/* Progress + Skip */}
          <div className={styles.progressWithSkip}>
            <FormStep totalSteps={7} currentStep={7} />

            <button 
              type="button"
              onClick={handleSkip}
              disabled={isRegistering}
              className={styles.skipButton}
            >
              Skip for Now
            </button>
          </div>

          {/* Heading */}
          <h1 className={styles.heading}>
            Verify Your Profile
          </h1>
          <p className={styles.subheading}>
            Help us ensure authenticity. Verified astrologers
            gain more visibility and trust from clients.
          </p>

          {/* Upload Fields */}
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

          <FileUploadInput
            label="Aadhar Card"
            optionalText=""
            accept="image/*,.pdf"
            value={formik.values.aadharCardImgUrl}
            isUploading={uploading.aadharCardImgUrl}
            onUpload={() => handleFileUpload("aadharCardImgUrl")}
            uploadText="Tap here to add file"
            uploadSubtext="(.jpg, .png, .pdf)"
          />

          <FileUploadInput
            label="PAN Card"
            optionalText=""
            accept="image/*,.pdf"
            value={formik.values.panCardImgUrl}
            isUploading={uploading.panCardImgUrl}
            onUpload={() => handleFileUpload("panCardImgUrl")}
            uploadText="Tap here to add file"
            uploadSubtext="(.jpg, .png, .pdf)"
          />
        </div>

        {/* Submit Button */}
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
