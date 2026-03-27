import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import toast from "../../../../components/toast";
import {
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
} from "../../../../redux/bankAccountApi/bankAccountApi";
import styles from "./BankAccount.module.scss";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit) {
        const { confirmAccountNumber, accountNumber, ifscCode, ...updateData } = form;
        await updateBankAccount({ bankAccId, ...updateData }).unwrap();
        toast.success("Bank account updated successfully");
      } else {
        const { confirmAccountNumber, ...addData } = form;
        await addBankAccount(addData).unwrap();
        toast.success("Bank account added successfully");
      }
      navigate("/bank-accounts");
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const getInputClass = (field) =>
    `${styles.input} ${errors[field] ? styles.inputError : ""}`;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <Icons.ChevronLeft size={20} />
        </button>
        <h1 className={styles.headerTitle}>
          {isEdit ? "Edit Bank Account" : "Add Bank Account"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Account Holder Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Account Holder Name</label>
          <input name="accountHolderName" value={form.accountHolderName} onChange={handleChange} className={getInputClass("accountHolderName")} placeholder="Enter account holder name" />
          {errors.accountHolderName && <p className={styles.errorText}>{errors.accountHolderName}</p>}
        </div>

        {/* Bank Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Bank Name</label>
          <input name="bankName" value={form.bankName} onChange={handleChange} className={getInputClass("bankName")} placeholder="Enter bank name" />
          {errors.bankName && <p className={styles.errorText}>{errors.bankName}</p>}
        </div>

        {/* Account Number (only for add) */}
        {!isEdit && (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Account Number</label>
              <input name="accountNumber" value={form.accountNumber} onChange={handleChange} className={getInputClass("accountNumber")} placeholder="Enter account number" maxLength={18} />
              {errors.accountNumber && <p className={styles.errorText}>{errors.accountNumber}</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm Account Number</label>
              <input name="confirmAccountNumber" value={form.confirmAccountNumber} onChange={handleChange} className={getInputClass("confirmAccountNumber")} placeholder="Re-enter account number" maxLength={18} />
              {errors.confirmAccountNumber && <p className={styles.errorText}>{errors.confirmAccountNumber}</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>IFSC Code</label>
              <input name="ifscCode" value={form.ifscCode} onChange={handleChange} className={`${getInputClass("ifscCode")} ${styles.inputUppercase}`} placeholder="e.g. ICIC0001959" />
              {errors.ifscCode && <p className={styles.errorText}>{errors.ifscCode}</p>}
            </div>
          </>
        )}

        {/* Branch Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Branch Name</label>
          <input name="branchName" value={form.branchName} onChange={handleChange} className={getInputClass("branchName")} placeholder="Enter branch name" />
          {errors.branchName && <p className={styles.errorText}>{errors.branchName}</p>}
        </div>

        {/* UPI ID */}
        <div className={styles.formGroup}>
          <label className={styles.label}>UPI ID (Optional)</label>
          <input name="upiId" value={form.upiId} onChange={handleChange} className={styles.input} placeholder="e.g. name@upi" />
        </div>

        {/* Account Type */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Account Type</label>
          <div className={styles.typeGroup}>
            {["savings", "current"].map((type) => (
              <label
                key={type}
                className={`${styles.typeOption} ${form.accountType === type ? styles.typeOptionActive : ""}`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={type}
                  checked={form.accountType === type}
                  onChange={handleChange}
                  className={styles.srOnly}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Primary Toggle */}
        <label className={styles.primaryToggle}>
          <div className={`${styles.toggleTrack} ${form.isPrimary ? styles.toggleTrackActive : ""}`}>
            <div className={`${styles.toggleThumb} ${form.isPrimary ? styles.toggleThumbActive : ""}`} />
          </div>
          <input type="checkbox" name="isPrimary" checked={form.isPrimary} onChange={handleChange} className={styles.srOnly} />
          <span className={styles.toggleText}>Set as primary account</span>
        </label>

        {/* Submit */}
        <div className={styles.submitFooter}>
          <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? (
              <div className={styles.spinnerSmall} />
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
