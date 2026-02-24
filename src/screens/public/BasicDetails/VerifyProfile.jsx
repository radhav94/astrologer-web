import { useState } from "react";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { updateRegisterData, setCurrentStep } from "../../../reducer/registerSlice";
import { createFileValidation } from "../../../utils/utlis";
import { useGetS3SignedUrlMutation } from "../../../redux/s3SignedApi";
import { useFileSelector } from "../../private/chat/filePicker/useFileSelector";
import { Toast } from "../../../components";

const VerifyProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [getS3SignedUrl] = useGetS3SignedUrlMutation();
  const { openFileSelector } = useFileSelector();
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

  // Formik setup
  const formik = useFormik({
    initialValues: {
      profileImgUrl: "",
      aadharCardImgUrl: "",
      panCardImgUrl: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Dispatch to Redux store
      dispatch(updateRegisterData({
        profileImgUrl: values.profileImgUrl,
        aadharCardImgUrl: values.aadharCardImgUrl,
        panCardImgUrl: values.panCardImgUrl,
      }));
      
      // Update current step
      dispatch(setCurrentStep(8));
      
      // Navigate to next step
      navigate("/verificationpending");
    },
  });

  const uploadFileToS3 = async (uploadUrl, blob) => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": blob.type,
      },
    });

    if (!res.ok) {
      throw new Error("S3 upload failed");
    }

    return "success";
  };

  const handleFileUpload = async (fieldName, acceptTypes = "image/*,.pdf") => {
    try {
      setUploading((prev) => ({ ...prev, [fieldName]: true }));

      // Open file selector
      const { blob } = await openFileSelector(acceptTypes);

      // Get signed URL from API
      const signedUrl = await getS3SignedUrl({
        fileType: blob.type,
      }).unwrap();

      const uploadUrl = signedUrl.uploadUrl;
      const fileUrl = uploadUrl.split("?")[0];

      // Upload to S3
      await uploadFileToS3(uploadUrl, blob);

      // Set the uploaded file URL in Formik and trigger validation
      await formik.setFieldValue(fieldName, fileUrl, true);
      formik.setFieldTouched(fieldName, true, true);

      Toast.success("File uploaded successfully");
    } catch (error) {
      console.error("File upload error:", error);
      if (error !== "No file selected") {
        Toast.error("Failed to upload file");
      }
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const UploadBox = ({ label, fieldName }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-left">
        {label}
      </label>

      <button
        type="button"
        onClick={() => handleFileUpload(fieldName)}
        disabled={uploading[fieldName]}
        className={`w-full border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer
          ${formik.touched[fieldName] && formik.errors[fieldName] ? "border-red-500" : ""}
          ${uploading[fieldName] ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <span className="text-sm text-gray-500 truncate">
          {uploading[fieldName]
            ? "Uploading..."
            : formik.values[fieldName]
            ? "File uploaded ✓"
            : "Add file (.jpg, .png, .pdf)"}
        </span>

        <Upload size={18} className="text-gray-600" />
      </button>
      {formik.touched[fieldName] && formik.errors[fieldName] && (
        <p className="text-red-500 text-xs mt-1">{formik.errors[fieldName]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex justify-center text-left">
      <div className="w-full max-w-md px-6 pt-10 pb-10 flex flex-col">

        {/* Progress + Skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-black rounded-full" />
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>

          <button 
            type="button"
            onClick={() => navigate("/verificationpending")}
            className="text-sm text-gray-600 underline"
          >
            Skip for Now
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2">
          Verify Your Profile
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Help us ensure authenticity. Verified astrologers
          gain more visibility and trust from clients.
        </p>

        {/* Upload Fields */}
        <UploadBox
          label="Profile Photo"
          fieldName="profileImgUrl"
        />

        <UploadBox
          label="Aadhar Card"
          fieldName="aadharCardImgUrl"
        />

        <UploadBox
          label="PAN Card"
          fieldName="panCardImgUrl"
        />

        {/* Next Button */}
        <button
          type="submit"
          onClick={formik.handleSubmit}
          disabled={!formik.isValid || formik.isSubmitting}
          className={`
            w-full py-3 rounded-xl font-medium transition mt-auto
            ${
              formik.isValid && !formik.isSubmitting
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VerifyProfile;
