import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mars, Transgender, Venus } from "lucide-react";
import { Icons } from "../../../../components/Icons";
import styles from "./ProfileForms.module.scss";
import Button from "../../../../components/UI/button/Button";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import FileUploadInput from "../../../../components/UI/fileUploadInput/FileUploadInput";
import { useFileUpload } from "../../../../hooks/useFileUpload";
import {
  nameValidationSchemas,
  genderValidationSchema,
  dobValidationSchema,
  emailValidationSchema,
} from "../../../../utils/utlis";

const Basic = () => {
  const navigate = useNavigate();
  const { uploadFile } = useFileUpload();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    name: nameValidationSchemas.fullName,
    gender: genderValidationSchema,
    dateOfBirth: dobValidationSchema,
    email: emailValidationSchema,
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: "Pandit Radha Swami",
      gender: "Female",
      dateOfBirth: "2002-01-01",
      email: "hariprasad@gmail.com",
      profilePhotoUrl: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Save logic here
      console.log("Form values:", values);
      navigate("/profile");
    },
  });

  const genderOptions = [
    { label: "Male", icon: <Mars /> },
    { label: "Female", icon: <Venus /> },
    { label: "Others", icon: <Transgender /> },
  ];

  const handleFileUpload = async () => {
    try {
      setUploadingPhoto(true);

      // Use the custom hook to upload file
      const fileUrl = await uploadFile("image/*,.pdf");

      if (fileUrl) {
        // Set the uploaded file URL in Formik
        formik.setFieldValue("profilePhotoUrl", fileUrl);
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Check if all required fields are filled and valid
  const isFormValid = 
    formik.values.name.trim() !== "" &&
    formik.values.gender !== "" &&
    formik.values.email.trim() !== "" &&
    Object.keys(formik.errors).length === 0;

  return (
    <div className={styles.basicContainer}>
      {/* Header */}
      <SectionHeader title="Basic Details" />

      {/* Form Content */}
      <div className={styles.formContent}>
        {/* Name Field */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Name</label>
          <input
            type="text"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`${styles.input} ${
              formik.touched.name && formik.errors.name ? styles.inputError : ""
            }`}
            placeholder="Enter your name"
          />
          {formik.touched.name && formik.errors.name && (
            <p className={styles.errorText}>{formik.errors.name}</p>
          )}
        </div>

        {/* Gender Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Your Identity</label>
          
          <div className={styles.genderOptions}>
            {genderOptions.map(({ label, icon }) => {
              const isActive = formik.values.gender === label;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => formik.setFieldValue("gender", label)}
                  className={`${styles.genderButton} ${
                    isActive ? styles.selected : ""
                  }`}
                >
                  <span className={styles.genderIcon}>
                    {icon}
                  </span>
                  <span className={styles.genderLabel}>{label}</span>
                </button>
              );
            })}
          </div>
          {formik.touched.gender && formik.errors.gender && (
            <p className={styles.errorText}>{formik.errors.gender}</p>
          )}
        </div>

        {/* Birth Date */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Birth Date</label>
          <div className={styles.dateInput}>
            <input
              type="date"
              name="dateOfBirth"
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${styles.input} ${
                formik.touched.dateOfBirth && formik.errors.dateOfBirth ? styles.inputError : ""
              }`}
            />
          </div>
          {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
            <p className={styles.errorText}>{formik.errors.dateOfBirth}</p>
          )}
        </div>

        {/* Email Address */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`${styles.input} ${
              formik.touched.email && formik.errors.email ? styles.inputError : ""
            }`}
            placeholder="example@gmail.com"
          />
          {formik.touched.email && formik.errors.email && (
            <p className={styles.errorText}>{formik.errors.email}</p>
          )}
        </div>

        {/* Profile Photo */}
        <FileUploadInput
          label="Profile Photo"
          optionalText=""
          accept="image/*,.pdf"
          value={formik.values.profilePhotoUrl}
          isUploading={uploadingPhoto}
          onUpload={handleFileUpload}
          uploadText="Tap here to add file"
          uploadSubtext="(.jpg, .png , .pdf)"
        />
      </div>

      {/* Save Button */}
      <Button 
        type="submit"
        onClick={formik.handleSubmit}
        disabled={!isFormValid || formik.isSubmitting}
        className={styles.saveButton}
      >
        Save <Icons.ChevronRight size={20} />
      </Button>
    </div>
  );
};

export default Basic;
