import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { Mars, Transgender, Venus } from "lucide-react";
import { Icons } from "../../../../components/Icons";
import styles from "./ProfileForms.module.scss";
import Button from "../../../../components/UI/button/Button";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import FileUploadInput from "../../../../components/UI/fileUploadInput/FileUploadInput";
import { useFileUpload } from "../../../../hooks/useFileUpload";
import { useSetAstroEditProfileMutation } from "../../../../redux/profileApi/profileApi";
import toast from "../../../../components/toast";
import DateTimePicker from "../../../../components/UI/dateTimePicker/DateTimePicker";
import {
  nameValidationSchemas,
  genderValidationSchema,
  dobValidationSchema,
  emailValidationSchema,
} from "../../../../utils/utils";
import dayjs from "dayjs";

const Basic = () => {
  const navigate = useNavigate();
  const { uploadFile } = useFileUpload();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [setAstroEditProfile, { isLoading: isUpdating }] =
    useSetAstroEditProfileMutation();
  
  // Get astrologer details from Redux state
  const astrologerDetails = useSelector((state) => state.register.astrologerDetails);
  const astrologerIdFromRedux = useSelector(
    (state) => state.register.astrologerId,
  );

  // Fallback to localStorage if Redux doesn't have the ID
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details") || "{}"
  );
  const astrologerId = astrologerIdFromRedux || userData?._id;

  // Use Redux state as primary source for prefilling form
  const existingData = astrologerDetails || userData;

  // Validation schema using reusable utilities from utils.js
  const validationSchema = Yup.object().shape({
    firstName: nameValidationSchemas.firstName,
    lastName: nameValidationSchemas.lastName,
    gender: genderValidationSchema,
    dateOfBirth: dobValidationSchema,
    email: emailValidationSchema,
    profileImgUrl: Yup.string().url("Please provide a valid URL"),
  });

  // Formik setup
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: existingData?.firstName || "",
      lastName: existingData?.lastName || "",
      gender: existingData?.gender ? existingData.gender.toLowerCase() : "",
      dateOfBirth: existingData?.dateOfBirth
        ? dayjs(existingData.dateOfBirth).format("YYYY-MM-DD")
        : "",
      email: existingData?.email || "",
      profileImgUrl: existingData?.profileImgUrl || "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        // Call the mutation API with the correct body format
        await setAstroEditProfile({
          id: astrologerId,
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth,
          email: values.email,
          profileImgUrl: values.profileImgUrl,
        }).unwrap();

        // Show success message
        toast.success("Profile updated successfully");

        // Navigate back to profile
        navigate("/profile");
      } catch (error) {
        // Handle error
        console.error("Failed to update profile:", error);
        toast.error(
          error?.data?.message || "Failed to update profile. Please try again.",
        );
      }
    },
  });

  const genderOptions = [
    { label: "Male",  value:"male",icon: <Mars /> },
    { label: "Female",value:"female", icon: <Venus /> },
    { label: "Others",value:"others", icon: <Transgender /> },
  ];

  console.log("gender from redux:", existingData?.gender);

  const handleFileUpload = async () => {
    try {
      setUploadingPhoto(true);

      // Use the custom hook to upload file
      const fileUrl = await uploadFile("image/*,.pdf");

      if (fileUrl) {
        // Set the uploaded file URL in Formik
        formik.setFieldValue("profileImgUrl", fileUrl);
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Check if all required fields are filled and valid
  // const isFormValid =
  //   formik.values.firstName.trim() !== "" &&
  //   formik.values.lastName.trim() !== "" &&
  //   formik.values.gender !== "" &&
  //   formik.values.dateOfBirth !== "" &&
  //   formik.values.email.trim() !== "" &&
  //   Object.keys(formik.errors).length === 0;

  // const isButtonDisabled = !isFormValid || formik.isSubmitting || isUpdating;

  const isButtonDisabled = formik.isSubmitting || isUpdating;

  console.log("isButtonDisabled::",  formik.isSubmitting ,isUpdating)
  console.log("formik.errors", formik.errors);
console.log("formik.isValid", formik.isValid);


useEffect(() => {
  if (formik.values.gender) {
    formik.setFieldTouched("gender", true, false);
  }
}, []);

  return (
    <div className={styles.basicContainer}>
      {/* Header */}
      <SectionHeader title="Basic Details" />

      {/* Form Content */}
      <div className={styles.formContent}>
        {/* First Name Field */}
        <div className={styles.formGroup}>
          <label className={styles.label}>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`${styles.input} ${
              formik.touched.firstName && formik.errors.firstName
                ? styles.inputError
                : ""
            }`}
            placeholder="Enter your first name"
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <p className={styles.errorText}>{formik.errors.firstName}</p>
          )}
        </div>

        {/* First Name Field */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`${styles.input} ${
              formik.touched.lastName && formik.errors.lastName
                ? styles.inputError
                : ""
            }`}
            placeholder="Enter your last name"
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <p className={styles.errorText}>{formik.errors.lastName}</p>
          )}
        </div>

        {/* Gender Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Your Identity</label>

          <div className={styles.genderOptions}>
            {genderOptions.map(({ label, value, icon }) => {
              const isActive = formik.values.gender === value;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    formik.setFieldValue("gender", value);
                    formik.setFieldTouched("gender", true);
                  }}
                  className={`${styles.genderButton} ${
                    isActive ? styles.selected : ""
                  }`}
                >
                  <span className={styles.genderIcon}>{icon}</span>
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
          {/* Old native date input — replaced with DateTimePicker
          <div className={styles.dateInput}>
            <input type="date" name="dateOfBirth" ... />
          </div>
          */}
          <DateTimePicker
            selected={formik.values.dateOfBirth ? new Date(formik.values.dateOfBirth) : null}
            onChange={(date) => {
              const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
              formik.setFieldValue("dateOfBirth", formatted);
              formik.setFieldTouched("dateOfBirth", true);
            }}
            mode="date"
            dateFormat="dd/MM/yyyy"
            placeholder="Select your birth date"
            maxDate={new Date()}
            className={
              formik.touched.dateOfBirth && formik.errors.dateOfBirth
                ? styles.inputError
                : ""
            }
          />
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
              formik.touched.email && formik.errors.email
                ? styles.inputError
                : ""
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
          value={formik.values.profileImgUrl}
          isUploading={uploadingPhoto}
          onUpload={handleFileUpload}
          uploadText="Tap here to add file"
          uploadSubtext="(.jpg, .png , .pdf)"
        />
        {formik.touched.profileImgUrl && formik.errors.profileImgUrl && (
          <p className={styles.errorText}>{formik.errors.profileImgUrl}</p>
        )}

        {/* Profile Image Preview - Only show if profileImgUrl exists */}
        {formik.values.profileImgUrl && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Current Profile Photo</label>
            <div className={styles.imagePreview}>
              <img
                src={formik.values.profileImgUrl}
                alt="Profile preview"
                className={styles.previewImage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <Button
        type="submit"
        onClick={formik.handleSubmit}
        disabled={isButtonDisabled}
        className={styles.saveButton}
      >
        {isUpdating ? "Saving..." : "Save"} <Icons.ChevronRight size={20} />
      </Button>
    </div>
  );
};

export default Basic;
