import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import toast from "../../../../components/toast";
import {
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
} from "../../../../redux/bankAccountApi/bankAccountApi";

const INITIAL_FORM = {
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifscCode: "",
  branchName: "",
  upiId: "",
  accountType: "savings",
  isPrimary: false,
};

const AddEditBankAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bankAccId } = useParams();
  const isEdit = Boolean(bankAccId);
  const existingAccount = location.state?.account;

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const [addBankAccount, { isLoading: isAdding }] = useAddBankAccountMutation();
  const [updateBankAccount, { isLoading: isUpdating }] = useUpdateBankAccountMutation();
  const isSubmitting = isAdding || isUpdating;

  useEffect(() => {
    if (isEdit && existingAccount) {
      setForm({
        accountHolderName: existingAccount.accountHolderName || "",
        bankName: existingAccount.bankName || "",
        accountNumber: existingAccount.accountNumber || "",
        confirmAccountNumber: existingAccount.accountNumber || "",
        ifscCode: existingAccount.ifscCode || "",
        branchName: existingAccount.branchName || "",
        upiId: existingAccount.upiId || "",
        accountType: existingAccount.accountType || "savings",
        isPrimary: existingAccount.isPrimary || false,
      });
    }
  }, [isEdit, existingAccount]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.accountHolderName.trim()) newErrors.accountHolderName = "Required";
    if (!form.bankName.trim()) newErrors.bankName = "Required";
    if (!isEdit) {
      if (!form.accountNumber.trim()) newErrors.accountNumber = "Required";
      else if (!/^\d{9,18}$/.test(form.accountNumber)) newErrors.accountNumber = "Invalid account number";
      if (form.accountNumber !== form.confirmAccountNumber) newErrors.confirmAccountNumber = "Account numbers don't match";
      if (!form.ifscCode.trim()) newErrors.ifscCode = "Required";
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.toUpperCase())) newErrors.ifscCode = "Invalid IFSC code";
    }
    if (!form.branchName.trim()) newErrors.branchName = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const printCurl = (method, url, body) => {
    const baseUrl = import.meta.env.VITE_APP_API_BASE_URL;
    const role = localStorage.getItem("shubhtalk_role");
    const token =
      role === "ASTROLOGER"
        ? localStorage.getItem("shubhtalk_astro_token")
        : localStorage.getItem("shubhtalk_customer_token");

    let curl = `curl -X '${method}' \\\n  '${baseUrl}/api/${url}' \\\n  -H 'accept: application/json' \\\n  -H 'Authorization: Bearer ${token}' \\\n  -H 'Content-Type: application/json'`;
    if (body) {
      curl += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
    }
    console.log("===== CURL =====");
    console.log(curl);
    console.log("===== TOKEN =====", token ? `${token.substring(0, 20)}...` : "MISSING");
    console.log("===== BODY =====", body);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit) {
        const { confirmAccountNumber, accountNumber, ifscCode, ...updateData } = form;
        printCurl("PUT", `astrologer-bank/bank-account?bankAccId=${bankAccId}`, updateData);
        await updateBankAccount({ bankAccId, ...updateData }).unwrap();
        toast.success("Bank account updated successfully");
      } else {
        const { confirmAccountNumber, ...addData } = form;
        printCurl("POST", "astrologer-bank", addData);
        await addBankAccount(addData).unwrap();
        toast.success("Bank account added successfully");
      }
      navigate("/bank-accounts");
    } catch (err) {
      console.error("===== API ERROR =====", err);
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-1 ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
        : "border-gray-200 focus:border-orange-400 focus:ring-orange-200"
    }`;

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          onClick={() => navigate(-1)}
        >
          <Icons.ChevronLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? "Edit Bank Account" : "Add Bank Account"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
        {/* Account Holder Name */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Account Holder Name</label>
          <input name="accountHolderName" value={form.accountHolderName} onChange={handleChange} className={inputClass("accountHolderName")} placeholder="Enter account holder name" />
          {errors.accountHolderName && <p className="text-[10px] text-red-500 mt-1">{errors.accountHolderName}</p>}
        </div>

        {/* Bank Name */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Bank Name</label>
          <input name="bankName" value={form.bankName} onChange={handleChange} className={inputClass("bankName")} placeholder="Enter bank name" />
          {errors.bankName && <p className="text-[10px] text-red-500 mt-1">{errors.bankName}</p>}
        </div>

        {/* Account Number (only for add) */}
        {!isEdit && (
          <>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Account Number</label>
              <input name="accountNumber" value={form.accountNumber} onChange={handleChange} className={inputClass("accountNumber")} placeholder="Enter account number" maxLength={18} />
              {errors.accountNumber && <p className="text-[10px] text-red-500 mt-1">{errors.accountNumber}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Confirm Account Number</label>
              <input name="confirmAccountNumber" value={form.confirmAccountNumber} onChange={handleChange} className={inputClass("confirmAccountNumber")} placeholder="Re-enter account number" maxLength={18} />
              {errors.confirmAccountNumber && <p className="text-[10px] text-red-500 mt-1">{errors.confirmAccountNumber}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">IFSC Code</label>
              <input name="ifscCode" value={form.ifscCode} onChange={handleChange} className={inputClass("ifscCode")} placeholder="e.g. ICIC0001959" style={{ textTransform: "uppercase" }} />
              {errors.ifscCode && <p className="text-[10px] text-red-500 mt-1">{errors.ifscCode}</p>}
            </div>
          </>
        )}

        {/* Branch Name */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Branch Name</label>
          <input name="branchName" value={form.branchName} onChange={handleChange} className={inputClass("branchName")} placeholder="Enter branch name" />
          {errors.branchName && <p className="text-[10px] text-red-500 mt-1">{errors.branchName}</p>}
        </div>

        {/* UPI ID */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">UPI ID (Optional)</label>
          <input name="upiId" value={form.upiId} onChange={handleChange} className={inputClass("upiId")} placeholder="e.g. name@upi" />
        </div>

        {/* Account Type */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Account Type</label>
          <div className="flex gap-3">
            {["savings", "current"].map((type) => (
              <label
                key={type}
                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-medium cursor-pointer border transition-colors ${
                  form.accountType === type
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={type}
                  checked={form.accountType === type}
                  onChange={handleChange}
                  className="sr-only"
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Primary Toggle */}
        <label className="flex items-center gap-3 cursor-pointer py-2">
          <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isPrimary ? "bg-orange-500" : "bg-gray-300"}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPrimary ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <input type="checkbox" name="isPrimary" checked={form.isPrimary} onChange={handleChange} className="sr-only" />
          <span className="text-sm text-gray-700">Set as primary account</span>
        </label>

        {/* Submit */}
        <div className="mt-auto pt-4 pb-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white font-medium py-3.5 rounded-2xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isEdit ? "Update Account" : "Add Account"}
                <Icons.ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditBankAccount;
