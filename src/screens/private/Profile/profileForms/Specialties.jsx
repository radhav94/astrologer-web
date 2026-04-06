import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { Icons } from "../../../../components/Icons";
import { useGetSpecialitiesListQuery } from "../../../../redux/register/registerAstroApi";
import { useSetAstroEditProfileMutation } from "../../../../redux/profileApi/profileApi";
import SectionHeader from "../../../../components/UI/sectionHeader/SectionHeader";
import Button from "../../../../components/UI/button/Button";
import Chip from "../../../../components/UI/chip/Chip";
import toast from "../../../../components/toast";
import styles from "./ProfileForms.module.scss";

const Specialties = () => {
  const navigate = useNavigate();
  const [setAstroEditProfile, { isLoading: isUpdating }] = useSetAstroEditProfileMutation();

  const astrologerDetails = useSelector((state) => state.register.astrologerDetails);
  const astrologerIdFromRedux = useSelector((state) => state.register.astrologerId);
  const userData = JSON.parse(localStorage.getItem("shubhtalk_astrologer_details") || "{}");
  const astrologerId = astrologerIdFromRedux || userData?._id;
  const existingData = astrologerDetails || userData;

  const { data: specialitiesData } = useGetSpecialitiesListQuery();

  const expertiseAreas = (specialitiesData?.data?.[0]?.list || []).map((apiItem, index) => ({
    id: index + 1,
    title: apiItem.title,
    slug: apiItem.slug,
  }));

  const existingSpecialties = (existingData?.specialties || []).map((item) =>
    typeof item === "string"
      ? { title: item, slug: item.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-") }
      : item
  );

  const validationSchema = Yup.object().shape({
    specialties: Yup.array()
      .of(Yup.object().shape({ title: Yup.string(), slug: Yup.string() }))
      .min(1, "Please select at least one specialty")
      .max(6, "You can select up to 6 specialties only")
      .required("Specialties is required"),
  });

  const formik = useFormik({
    initialValues: { specialties: existingSpecialties },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await setAstroEditProfile({
          id: astrologerId,
          specialties: values.specialties.map((item) => ({ title: item.title, slug: item.slug })),
        }).unwrap();
        toast.success("Specialties updated successfully");
        navigate("/profile");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to update specialties.");
      }
    },
  });

  const isSelected = (slug) => formik.values.specialties.some((s) => s?.slug === slug);

  const toggleSelect = (item) => {
    const current = formik.values.specialties;
    if (isSelected(item.slug)) {
      formik.setFieldValue("specialties", current.filter((s) => s?.slug !== item.slug));
    } else {
      formik.setFieldValue("specialties", [...current, { title: item.title, slug: item.slug }]);
    }
  };

  const isFormValid = formik.values.specialties.length > 0 && Object.keys(formik.errors).length === 0;

  return (
    <div className={styles.basicContainer}>
      <SectionHeader title="Specialties" />

      <div className={styles.formContent}>
        <p className={styles.sectionSubtext}>
          Choose the life areas you specialize in (up to 6).
        </p>

        <div className={styles.chipGrid}>
          {expertiseAreas.map((item) => (
            <Chip
              key={item.id}
              label={item.title}
              selected={isSelected(item.slug)}
              onClick={() => toggleSelect(item)}
            />
          ))}
        </div>

        {formik.touched.specialties && formik.errors.specialties && (
          <p className={styles.errorText}>{formik.errors.specialties}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="small"
          fullWidth={false}
          onClick={formik.handleSubmit}
          disabled={!isFormValid || isUpdating}
          icon={<Icons.ChevronRight size={14} />}
          className={styles.saveButtonThird}
        >
          {isUpdating ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default Specialties;
