import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { Plus } from "lucide-react";
import { Icons } from "../../../../components/Icons";
import Button from "../../../../components/UI/button/Button";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import FileUploadInput from "../../../../components/UI/fileUploadInput/FileUploadInput";
import styles from "./ProfileForms.module.scss";
import { createEducationValidation } from "../../../../utils/utils";
import { useFileUpload } from "../../../../hooks/useFileUpload";
import { useSetAstroEditProfileMutation } from "../../../../redux/profileApi/profileApi";
import toast from "../../../../components/toast";
import { AppIcons } from "../../../../utils/appImages";
import Toggle from "../../../../components/UI/toggle/Toggle";

const EDUCATION_LEVELS = [
  "High School",
  "Undergraduate",
  "Postgraduate",
  "Prefer not to say",
];

const EducationDetails = () => {
  const navigate = useNavigate();
  const { uploadFile } = useFileUpload();
  const [setAstroEditProfile, { isLoading: isUpdating }] =
    useSetAstroEditProfileMutation();

  // Get astrologer details from Redux state
  const astrologerDetails = useSelector(
    (state) => state.register.astrologerDetails,
  );
  const astrologerIdFromRedux = useSelector(
    (state) => state.register.astrologerId,
  );

  // Fallback to localStorage if Redux doesn't have the ID
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details") || "{}",
  );
  const astrologerId = astrologerIdFromRedux || userData?._id;

  // Use Redux state as primary source for prefilling form
  const existingData = astrologerDetails || userData;

  // Get existing education from Redux
  const existingEducation = existingData?.education || [];

  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [viewingAttachments, setViewingAttachments] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get display status from existing education entries
  const displayStatus = existingEducation.length > 0 
    ? existingEducation[0].display 
    : false;

  // 🔥 FORCE SCROLL TO TOP
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const scrollables = document.querySelectorAll("*");
    scrollables.forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
    });
  }, []);

  // Validation schema
  const validationSchema = Yup.object().shape({
    education: createEducationValidation({
      required: true,
      minEntries: 1,
      universityRequired: false,
      certificateRequired: false,
    }),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      qualification: "",
      universityName: "",
      certificateImgUrl: "",
      display:displayStatus,
    },
    validationSchema: Yup.object().shape({
      qualification: Yup.string().required("Qualification is required"),
      universityName: Yup.string(),
      certificateImgUrl: Yup.string(),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        let updatedEducation;

        if (editingIndex !== null) {
          // Update existing education entry
          updatedEducation = [...existingEducation];
          updatedEducation[editingIndex] = {
            qualification: values.qualification,
            universityName: values.universityName,
            certificateImgUrl: values.certificateImgUrl,
            display: values.display,
          };
        } else {
          // Add new education entry
          updatedEducation = [
            ...existingEducation,
            {
              qualification: values.qualification,
              universityName: values.universityName,
              certificateImgUrl: values.certificateImgUrl,
              display: values.display,
            },
          ];
        }

        // Call the mutation API
        await setAstroEditProfile({
          id: astrologerId,
          education: updatedEducation,
        }).unwrap();

        // Show success message
        toast.success("Education details updated successfully");

        // Reset form and state
        formik.resetForm();
        setIsAddingNew(false);
        setEditingIndex(null);
      } catch (error) {
        console.error("Failed to update education:", error);
        toast.error(
          error?.data?.message ||
            "Failed to update education. Please try again.",
        );
      }
    },
  });

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingIndex(null);
    formik.resetForm();
  };

  const handleEdit = (index) => {
    const edu = existingEducation[index];
    setEditingIndex(index);
    setIsAddingNew(true);
    formik.setValues({
      qualification: edu.qualification || "",
      universityName: edu.universityName || "",
      certificateImgUrl: edu.certificateImgUrl || "",
      display: edu.display ?? false,
    });
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
    formik.resetForm();
  };

  const handleFileUpload = async () => {
    try {
      setUploadingCertificate(true);
      const fileUrl = await uploadFile("image/*,.pdf");

      if (fileUrl) {
        formik.setFieldValue("certificateImgUrl", fileUrl);
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setUploadingCertificate(false);
    }
  };

  const handleRemoveCertificate = () => {
    formik.setFieldValue("certificateImgUrl", "");
  };

  const handleDeleteClick = (index) => {
    setDeletingIndex(index);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Remove the education entry at deletingIndex
      const updatedEducation = existingEducation.filter(
        (_, index) => index !== deletingIndex
      );

      // Call the mutation API
      await setAstroEditProfile({
        id: astrologerId,
        education: updatedEducation,
      }).unwrap();

      // Show success message
      toast.success("Education record removed successfully");

      // Close modal and reset state
      setShowDeleteModal(false);
      setDeletingIndex(null);
    } catch (error) {
      console.error("Failed to delete education:", error);
      toast.error(
        error?.data?.message ||
          "Failed to remove education. Please try again."
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingIndex(null);
  };

  // Old: same disabled logic for both add and edit
  // const isFormValid =
  //   formik.values.qualification.trim() !== "" && formik.isValid;
  // const isButtonDisabled = !isFormValid || formik.isSubmitting || isUpdating;

  // New: edit mode — always enabled (unless submitting); add mode — require valid form
  const isFormValid =
    formik.values.qualification.trim() !== "" && formik.isValid;

  const isButtonDisabled = editingIndex !== null
    ? formik.isSubmitting || isUpdating
    : !isFormValid || formik.isSubmitting || isUpdating;

  return (
    <div className={styles.basicContainer}>
      <SectionHeader title="Educational Details" />

      <div className={styles.formContent}>
        {/* Education Grid Container */}
        {!isAddingNew && (
          <>
            <div className={styles.educationList}>
              {/* Existing Education Cards */}
              {existingEducation.length > 0 ? (
                existingEducation.map((edu, index) => (
                  <div key={index} className={styles.educationCard}>
                    <div className={styles.educationCardHeader}>
                      <span className={styles.educationLevel}>
                        {edu?.qualification || edu?.levelOfEducation}
                      </span>
                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          onClick={() => handleEdit(index)}
                          className={styles.editIconButton}
                        >
                          <img src={AppIcons.EditIcon} alt="Edit Icons" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(index)}
                          className={styles.deleteIconButton}
                          aria-label="Delete education"
                        >
                          <Icons.X size={20} />
                        </button>
                      </div>
                    </div>
                    <h3 className={styles.universityName}>
                      {edu.universityName || "No university specified"}
                    </h3>
                    {edu.certificateImgUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setViewingAttachments(edu.certificateImgUrl)
                        }
                        className={styles.viewAttachmentsButton}
                      >
                        View Attachments
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.educationEmptyState}>
                  <div className={styles.educationEmptyContent}>
                    <img
                      src={AppIcons.Education1}
                      alt="Education"
                      className={styles.educationEmptyIcon}
                    />
                    <h2 className={styles.educationEmptyTitle}>
                      No education added yet
                    </h2>
                    <p className={styles.educationEmptySubtitle}>
                      Add your education details below
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Add New Button */}
            <button
              type="button"
              onClick={handleAddNew}
              className={styles.addQualificationButton}
            >
              <Plus size={20} />
              Add Qualification
            </button>
          </>
        )}

        {/* Add/Edit Form */}
        {isAddingNew && (
          <div className={styles.educationForm}>
            {/* Qualification Level */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Level of Education</label>
              <div className={styles.chipContainer}>
                {EDUCATION_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      formik.setFieldValue(
                        "qualification",
                        formik.values.qualification === level ? "" : level,
                      )
                    }
                    className={`${styles.chip} ${
                      formik.values.qualification === level
                        ? styles.chipActive
                        : ""
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              {formik.touched.qualification && formik.errors.qualification && (
                <p className={styles.errorText}>
                  {formik.errors.qualification}
                </p>
              )}
            </div>

            {/* University */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                University/College Name
                <span className={styles.optionalText}> (if any)</span>
              </label>
              <input
                type="text"
                name="universityName"
                value={formik.values.universityName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={styles.input}
                placeholder="Enter university name"
              />
            </div>

            {/* Certificate Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Attachments</label>
              <div className={styles.attachmentsGrid}>
                {/* attachments preview */}
                {formik.values.certificateImgUrl && (
                  <div className={styles.attachmentItem}>
                    <button
                      type="button"
                      onClick={handleRemoveCertificate}
                      className={styles.removeAttachmentButton}
                      aria-label="Remove certificate"
                    >
                      <Icons.X size={24} />
                    </button>
                    <img
                      src={formik.values.certificateImgUrl}
                      alt="attachment"
                      className={styles.attachmentImage}
                    />
                  </div>
                )}
                <FileUploadInput
                  optionalText="(if any)"
                  accept="image/*,.pdf"
                  value=""
                  isUploading={uploadingCertificate}
                  onUpload={handleFileUpload}
                  uploadText="Add"
                  uploadSubtext="(.jpg, .png, .pdf)"
                />
              </div>
            </div>

            {/* Display on Profile Toggle */}
            <div className="mb-6 flex">
              <Toggle
                label="Display on Profile"
                className="inline-flex"
                checked={formik.values.display}
                onChange={(value) => formik.setFieldValue("display", value)}
              />
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <Button
                type="submit"
                onClick={formik.handleSubmit}
                disabled={isButtonDisabled}
                className={styles.saveFormButton}
              >
                {isUpdating
                  ? "Saving..."
                  : editingIndex !== null
                    ? "Update"
                    : "Add"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Attachment Viewer Modal */}
      {viewingAttachments && (
        <div
          className={styles.attachmentModal}
          onClick={() => setViewingAttachments(null)}
        >
          <div
            className={styles.attachmentModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeModal}
              onClick={() => setViewingAttachments(null)}
            >
              <Icons.X size={20} />
            </button>
            <img
              src={viewingAttachments}
              alt="Certificate"
              className={styles.attachmentImage}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.attachmentModal} onClick={handleDeleteCancel}>
          <div
            className={styles.deleteModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.deleteModalTitle}>Remove Education Record</h3>
            <p className={styles.deleteModalText}>
              Are you sure you want to remove this education record? This action
              cannot be undone.
            </p>
            <div className={styles.deleteModalActions}>
              <button
                type="button"
                onClick={handleDeleteCancel}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isUpdating}
                className={styles.deleteConfirmButton}
              >
                {isUpdating ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationDetails;
