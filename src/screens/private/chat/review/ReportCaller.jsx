import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useGetReportReasonsQuery } from "../../../../redux/review/reviewApi";

const STATIC_REPORT_CATEGORIES = [
  { value: "abuse", label: "Abuse / Harassment" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Behavior" },
  { value: "fraud", label: "Fraud / Scam" },
  { value: "other", label: "Other" },
];

const validationSchema = Yup.object().shape({
  reasonId: Yup.string().required("Please select a report category"),
  description: Yup.string().max(500, "Description must not exceed 500 characters"),
});

const ReportCaller = ({ isOpen, onClose, onSubmit, isSubmitting = false, callerName = "" }) => {
  const [selectOpen, setSelectOpen] = useState(false);
  const { data: reportReasonsResponse } = useGetReportReasonsQuery(undefined, { skip: !isOpen });

  // Dynamic categories from API, fallback to static
  const REPORT_CATEGORIES = reportReasonsResponse?.data?.length
    ? reportReasonsResponse.data.map((item) => ({
        value: item?._id,
        label: item?.title,
      }))
    : STATIC_REPORT_CATEGORIES;

  const formik = useFormik({
    initialValues: {
      reasonId: "",
      description: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      onSubmit?.(values);
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    formik.resetForm();
    onClose?.();
  };

  const isFormValid = formik.values.reasonId !== "" && Object.keys(formik.errors).length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[450px] rounded-2xl bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-gray-500 hover:text-black disabled:opacity-50"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-center text-lg font-semibold">Report Caller</h2>

        {/* Caller info */}
        {callerName && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #f75801, #d43400)" }}
            >
              {callerName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <p className="font-medium text-gray-800 capitalize">{callerName}</p>
          </div>
        )}

        {/* Report categories — select dropdown */}
        <div className="mt-4">
          <p className="text-sm text-left font-semibold text-gray-700 mb-2">Select a reason</p>
          <div className="relative">
            <select
              name="reasonId"
              value={formik.values.reasonId}
              onChange={formik.handleChange}
              onFocus={() => setSelectOpen(true)}
              onBlur={(e) => { setSelectOpen(false); formik.handleBlur(e); }}
              className={`w-full rounded-xl border px-4 py-3 pr-10 text-sm font-medium outline-none cursor-pointer appearance-none bg-white transition ${
                formik.values.reasonId
                  ? "border-orange-500 text-gray-800"
                  : "border-gray-200 text-gray-400"
              } focus:border-orange-500`}
            >
              <option value="">Select a reason</option>
              {REPORT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {selectOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>
          {formik.touched.reasonId && formik.errors.reasonId && (
            <p className="text-xs text-red-500 mt-1">{formik.errors.reasonId}</p>
          )}
        </div>

        {/* Description textarea */}
        <div className="mt-4">
          <textarea
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Additional details (optional)"
            className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-orange-500 focus:outline-none"
            rows={3}
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-xs text-red-500 mt-1">{formik.errors.description}</p>
          )}
          <div className="mt-1 text-right text-xs text-gray-400">
            {formik.values.description.length}/500
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 rounded-lg py-3 font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={formik.handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`flex-1 rounded-lg py-3 font-medium transition ${
              isFormValid && !isSubmitting
                ? "text-white hover:opacity-90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            style={isFormValid && !isSubmitting ? { background: "linear-gradient(90deg, #f75801, #d43400)" } : {}}
          >
            {isSubmitting ? "Submitting..." : "Submit & End"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCaller;
