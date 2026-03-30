import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { Icons } from "../../../../components/Icons";
import toast from "../../../../components/toast";
import {
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
} from "../../../../redux/bankAccountApi/bankAccountApi";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import Button from "../../../../components/UI/button/Button";
import Toggle from "../../../../components/UI/toggle/Toggle";
import { getAddBankAccountSchema, getEditBankAccountSchema } from "../../../../utils/utils";
import styles from "./BankAccount.module.scss";

const AddEditBankAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bankAccId } = useParams();
  const isEdit = Boolean(bankAccId);
  const existingAccount = location.state?.account;

  const [addBankAccount, { isLoading: isAdding }] = useAddBankAccountMutation();
  const [updateBankAccount, { isLoading: isUpdating }] = useUpdateBankAccountMutation();
  const isSubmitting = isAdding || isUpdating;

  const formik = useFormik({
    initialValues: {
      accountHolderName: existingAccount?.accountHolderName || "",
      accountNumber: isEdit ? existingAccount?.accountNumber || "" : "",
      confirmAccountNumber: isEdit ? existingAccount?.accountNumber || "" : "",
      ifscCode: isEdit ? existingAccount?.ifscCode || "" : "",
      bankName: existingAccount?.bankName || "",
      branchName: existingAccount?.branchName || "",
      accountType: existingAccount?.accountType || "savings",
      isPrimary: existingAccount?.isPrimary || false,
    },
    validationSchema: isEdit ? getEditBankAccountSchema() : getAddBankAccountSchema(),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          const { confirmAccountNumber, accountNumber, ifscCode, ...updateData } = values;
          await updateBankAccount({ bankAccId, ...updateData }).unwrap();
          toast.success("Bank account updated successfully");
          navigate("/withdraw-money");
        } else {
          const { confirmAccountNumber, ...addData } = values;
          await addBankAccount(addData).unwrap();
          navigate("/bank-account-success", { replace: true });
        }
      } catch (err) {
        toast.error(err?.data?.message || "Something went wrong");
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue } = formik;

  const getInputClass = (field) =>
    `${styles.input} ${touched[field] && errors[field] ? styles.inputError : ""}`;

  const showError = (field) => touched[field] && errors[field];

  return (
    <div className={styles.container}>
      {/* Header */}
      <SectionHeader title={isEdit ? "Edit Bank Account" : "Add Bank Account"} />

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Account Holder Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Account Holder Name <span className={styles.required}>*</span></label>
          <input
            name="accountHolderName"
            value={values.accountHolderName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass("accountHolderName")}
            placeholder="Enter account holder name"
          />
          {showError("accountHolderName") && <p className={styles.errorText}>{errors.accountHolderName}</p>}
        </div>

        {/* Account Number & Confirm (add only) */}
        {!isEdit && (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Account Number <span className={styles.required}>*</span></label>
              <input
                name="accountNumber"
                value={values.accountNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("accountNumber")}
                placeholder="Enter account number"
                maxLength={18}
                inputMode="numeric"
              />
              {showError("accountNumber") && <p className={styles.errorText}>{errors.accountNumber}</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm Account Number <span className={styles.required}>*</span></label>
              <input
                name="confirmAccountNumber"
                value={values.confirmAccountNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass("confirmAccountNumber")}
                placeholder="Re-enter account number"
                maxLength={18}
                inputMode="numeric"
              />
              {showError("confirmAccountNumber") && <p className={styles.errorText}>{errors.confirmAccountNumber}</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>IFSC Code <span className={styles.required}>*</span></label>
              <input
                name="ifscCode"
                value={values.ifscCode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getInputClass("ifscCode")} ${styles.inputUppercase}`}
                placeholder="Enter IFSC code"
              />
              {showError("ifscCode") && <p className={styles.errorText}>{errors.ifscCode}</p>}
            </div>
          </>
        )}

        {/* Bank Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Bank Name <span className={styles.required}>*</span></label>
          <input
            name="bankName"
            value={values.bankName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass("bankName")}
            placeholder="Enter bank name"
          />
          {showError("bankName") && <p className={styles.errorText}>{errors.bankName}</p>}
        </div>

        {/* Branch Name (Optional) */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Branch Name (Optional)</label>
          <input
            name="branchName"
            value={values.branchName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.input}
            placeholder="Enter branch name"
          />
        </div>

        {/* Account Type */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Account Type <span className={styles.required}>*</span></label>
          <div className={styles.typeGroup}>
            {["savings", "current"].map((type) => (
              <button
                key={type}
                type="button"
                className={`${styles.typeOption} ${values.accountType === type ? styles.typeOptionActive : ""}`}
                onClick={() => setFieldValue("accountType", type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Toggle */}
        <Toggle
          label="Set as Primary Account"
          checked={values.isPrimary}
          onChange={(val) => setFieldValue("isPrimary", val)}
          className={styles.primaryToggle}
        />

        {/* Submit */}
        <div className={styles.submitFooter}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            icon={!isSubmitting ? <Icons.ChevronRight size={16} /> : undefined}
          >
            {isSubmitting ? <div className={styles.spinnerSmall} /> : (isEdit ? "Update Bank" : "Add Bank")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEditBankAccount;
