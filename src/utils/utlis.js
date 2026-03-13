export const combineClasses = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const requiredMessage = (name = "This field") => {
  return `${name} is required!`;
};

export const getToken = () => {
  return localStorage.getItem("shubhtalk_astro_token");
};

export const getDefaultImgBasedOnGender = (gender) => {
  if (gender?.toLowerCase() === "male") {
    return AppDefaultImg.DefaultMaleAstrologer;
  }

  return AppDefaultImg.DefaultFemaleAstrologer;
};


export const formatIndianPhone = (phone) => {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle phone with country code (12 digits: 91 + 10 digits)
  if (digits.length === 12 && digits.startsWith('91')) {
    const countryCode = digits.slice(0, 2);
    const firstPart = digits.slice(2, 7);
    const secondPart = digits.slice(7, 12);
    return `+${countryCode} ${firstPart} ${secondPart}`;
  }
  
  // Handle phone without country code (10 digits)
  if (digits.length === 10) {
    const firstPart = digits.slice(0, 5);
    const secondPart = digits.slice(5, 10);
    return `+91 ${firstPart} ${secondPart}`;
  }
  
  // Return original if format doesn't match
  return phone;
};


// ============================================
// FORMIK & YUP VALIDATION UTILITIES
// ============================================

import * as Yup from 'yup';
import { AppDefaultImg } from './appImages';

/**
 * Create a name validation schema with configurable options
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {number} options.minLength - Minimum length (default: 2)
 * @param {number} options.maxLength - Maximum length (default: 50)
 * @param {RegExp} options.customRegex - Custom regex pattern (default: alphabets only)
 * @param {string} options.fieldName - Field name for error messages (default: "This field")
 * @returns {Yup.StringSchema} Yup validation schema
 */
export const createNameValidation = (options = {}) => {
  const {
    required = true,
    minLength = 2,
    maxLength = 50,
    customRegex = /^[a-zA-Z\s]+$/,
    fieldName = "This field",
  } = options;

  let schema = Yup.string().trim();

  if (required) {
    schema = schema.required(`${fieldName} is required`);
  }

  schema = schema
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must not exceed ${maxLength} characters`)
    .matches(customRegex, `${fieldName} can only contain alphabets and spaces`);

  return schema;
};

/**
 * Pre-configured validation schemas for common name fields
 */
export const nameValidationSchemas = {
  firstName: createNameValidation({
    fieldName: "First name",
    minLength: 2,
    maxLength: 30,
  }),
  
  lastName: createNameValidation({
    fieldName: "Last name",
    minLength: 2,
    maxLength: 30,
  }),
  
  fullName: createNameValidation({
    fieldName: "Full name",
    minLength: 3,
    maxLength: 60,
  }),
};

/**
 * Gender validation schema
 */
export const genderValidationSchema = Yup.string()
  .oneOf(["Male", "Female", "Others", "male", "female", "others"], "Please select a valid gender")
  .required("Gender is required");

/**
 * Date of birth validation schema with age verification
 */
export const dobValidationSchema = Yup.date()
  .required("Date of birth is required")
  .max(new Date(), "Date of birth cannot be in the future")
  .test("age", "You must be at least 18 years old", function (value) {
    if (!value) return false;
    const today = new Date();
    const birthDate = new Date(value);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  });

/**
 * Email validation schema
 */
export const emailValidationSchema = Yup.string()
  .trim()
  .email("Please enter a valid email address")
  .required("Email address is required");

/**
 * Create validation schema for dynamic language preferences array
 * Each language entry must have a languageName and proficiencyLevel
 * @param {Object} options - Configuration options
 * @param {number} options.minLanguages - Minimum number of languages required (default: 1)
 * @param {number} options.maxLanguages - Maximum number of languages allowed (optional)
 * @param {Array<string>} options.validProficiencyLevels - Valid proficiency level options
 * @returns {Yup.ArraySchema} Yup validation schema
 * 
 * @example
 * const languageSchema = createLanguagePreferencesValidation({
 *   minLanguages: 1,
 *   maxLanguages: 5,
 *   validProficiencyLevels: ["Basic", "Conversational", "Fluent", "Native"]
 * });
 */
export const createLanguagePreferencesValidation = (options = {}) => {
  const {
    minLanguages = 1,
    maxLanguages = null,
    validProficiencyLevels = ["Basic", "Conversational", "Fluent", "Native"],
  } = options;

  let schema = Yup.array()
    .of(
      Yup.object().shape({
        languageName: Yup.string()
          .trim()
          .required("Language name is required"),
        proficiencyLevel: Yup.string()
          .oneOf(validProficiencyLevels, "Please select a valid proficiency level")
          .required("Proficiency level is required"),
      })
    )
    .min(
      minLanguages,
      minLanguages === 1
        ? "Please select at least one language"
        : `Please select at least ${minLanguages} languages`
    );

  if (maxLanguages !== null && maxLanguages > 0) {
    schema = schema.max(
      maxLanguages,
      `You can select up to ${maxLanguages} languages only`
    );
  }

  // Ensure all selected languages have proficiency levels
  schema = schema.test(
    "all-have-proficiency",
    "Please set proficiency level for all selected languages",
    (value) => {
      if (!value || value.length === 0) return true;
      return value.every((lang) => lang.proficiencyLevel && lang.proficiencyLevel.trim() !== "");
    }
  );

  return schema;
};

/**
 * Create validation schema for education entries array
 * Each education entry must have qualification, universityName, and certificateImgUrl
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - Whether at least one education entry is required (default: true)
 * @param {number} options.minEntries - Minimum number of education entries (default: 1 if required)
 * @param {number} options.maxEntries - Maximum number of education entries (optional)
 * @param {boolean} options.universityRequired - Whether university is required (default: false)
 * @param {boolean} options.certificateRequired - Whether certificate is required (default: false)
 * @returns {Yup.ArraySchema} Yup validation schema
 * 
 * @example
 * const educationSchema = createEducationValidation({
 *   required: true,
 *   minEntries: 1,
 *   universityRequired: false,
 *   certificateRequired: false
 * });
 */
export const createEducationValidation = (options = {}) => {
  const {
    required = true,
    minEntries = required ? 1 : 0,
    maxEntries = null,
    universityRequired = false,
    certificateRequired = false,
  } = options;

  let schema = Yup.array().of(
    Yup.object().shape({
      qualification: Yup.string()
        .trim()
        .required("Qualification is required"),
      universityName: universityRequired
        ? Yup.string().trim().required("University name is required")
        : Yup.string().trim(),
      certificateImgUrl: certificateRequired
        ? Yup.string().trim().required("Certificate is required")
        : Yup.string().trim(),
    })
  );

  if (required && minEntries > 0) {
    schema = schema.min(
      minEntries,
      minEntries === 1
        ? "Please add at least one education entry"
        : `Please add at least ${minEntries} education entries`
    );
  }

  if (maxEntries !== null && maxEntries > 0) {
    schema = schema.max(
      maxEntries,
      `You can add up to ${maxEntries} education entries only`
    );
  }

  return schema;
};

/**
 * Create validation schema for achievements array
 * Each achievement entry must have achievementName, achievementImgUrl, and display
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - Whether at least one achievement is required (default: true)
 * @param {number} options.minEntries - Minimum number of achievements (default: 1 if required)
 * @param {number} options.maxEntries - Maximum number of achievements (optional)
 * @param {number} options.minLength - Minimum length for achievement description (default: 10)
 * @param {number} options.maxLength - Maximum length for achievement description (default: 500)
 * @param {boolean} options.certificateRequired - Whether certificate is required (default: false)
 * @returns {Yup.ArraySchema} Yup validation schema
 * 
 * @example
 * const achievementsSchema = createAchievementsValidation({
 *   required: true,
 *   minEntries: 1,
 *   minLength: 10,
 *   certificateRequired: false
 * });
 */
export const createAchievementsValidation = (options = {}) => {
  const {
    required = true,
    minEntries = required ? 1 : 0,
    maxEntries = null,
    minLength = 10,
    maxLength = 500,
    certificateRequired = false,
  } = options;

  let schema = Yup.array().of(
    Yup.object().shape({
      achievementName: Yup.string()
        .trim()
        .required("Achievement description is required")
        .min(minLength, `Achievement must be at least ${minLength} characters`)
        .max(maxLength, `Achievement must not exceed ${maxLength} characters`),
      achievementImgUrl: certificateRequired
        ? Yup.string().trim().required("Certificate is required")
        : Yup.string().trim(),
      display: Yup.boolean(),
    })
  );

  if (required && minEntries > 0) {
    schema = schema.min(
      minEntries,
      minEntries === 1
        ? "Please add at least one achievement"
        : `Please add at least ${minEntries} achievements`
    );
  }

  if (maxEntries !== null && maxEntries > 0) {
    schema = schema.max(
      maxEntries,
      `You can add up to ${maxEntries} achievements only`
    );
  }

  return schema;
};

/**
 * Create validation schema for file upload fields
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - Whether file is required (default: true)
 * @param {string} options.fieldName - Field name for error messages (default: "File")
 * @returns {Yup.StringSchema} Yup validation schema
 * 
 * @example
 * const fileSchema = createFileValidation({
 *   fieldName: "Profile photo",
 *   required: true
 * });
 */
export const createFileValidation = (options = {}) => {
  const {
    required = true,
    fieldName = "File",
  } = options;

  let schema = Yup.string().trim();

  if (required) {
    schema = schema
      .required(`${fieldName} is required`)
      .test(
        "not-dummy",
        `Please upload ${fieldName.toLowerCase()}`,
        (value) => value && value !== "dummy-url-for-now" && value !== ""
      );
  }

  return schema;
};

/**
 * Create a dropdown validation schema with configurable options
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {Array<string>} options.validOptions - Array of valid option values (optional)
 * @param {string} options.fieldName - Field name for error messages (default: "This field")
 * @param {string} options.emptyValue - Value considered as empty/placeholder (default: "")
 * @returns {Yup.StringSchema} Yup validation schema
 * 
 * @example
 * const countrySchema = createDropdownValidation({
 *   fieldName: "Country",
 *   validOptions: ["USA", "Canada", "UK"],
 *   required: true
 * });
 */
export const createDropdownValidation = (options = {}) => {
  const {
    required = true,
    validOptions = [],
    fieldName = "This field",
    emptyValue = "",
  } = options;

  let schema = Yup.string();

  if (required) {
    schema = schema
      .required(`${fieldName} is required`)
      .test(
        "not-empty",
        `Please select a valid ${fieldName.toLowerCase()}`,
        (value) => value !== emptyValue
      );
  }

  // If valid options are provided, ensure the value is one of them
  if (validOptions.length > 0) {
    schema = schema.oneOf(
      validOptions,
      `Please select a valid ${fieldName.toLowerCase()}`
    );
  }

  return schema;
};

/**
 * Create a multi-select chips validation schema with configurable options
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - Whether at least one selection is required (default: true)
 * @param {number} options.minSelections - Minimum number of selections (default: 1 if required, 0 otherwise)
 * @param {number} options.maxSelections - Maximum number of selections (optional)
 * @param {string} options.fieldName - Field name for error messages (default: "This field")
 * @returns {Yup.ArraySchema} Yup validation schema
 * 
 * @example
 * const skillsSchema = createMultiSelectValidation({
 *   fieldName: "Skills",
 *   minSelections: 2,
 *   maxSelections: 5,
 *   required: true
 * });
 */
export const createMultiSelectValidation = (options = {}) => {
  const {
    required = true,
    minSelections = required ? 1 : 0,
    maxSelections = null,
    fieldName = "This field",
  } = options;

  let schema = Yup.array();

  if (required) {
    schema = schema.required(`${fieldName} is required`);
  }

  // Minimum selections validation
  if (minSelections > 0) {
    schema = schema.min(
      minSelections,
      minSelections === 1
        ? `Please select at least one ${fieldName.toLowerCase()}`
        : `Please select at least ${minSelections} ${fieldName.toLowerCase()}`
    );
  }

  // Maximum selections validation
  if (maxSelections !== null && maxSelections > 0) {
    schema = schema.max(
      maxSelections,
      `You can select up to ${maxSelections} ${fieldName.toLowerCase()} only`
    );
  }

  return schema;
};

/**
 * Create a complete form validation schema
 * @param {Object} fields - Object with field names as keys and validation configs as values
 * @returns {Yup.ObjectSchema} Complete Yup validation schema
 * 
 * @example
 * const schema = createFormValidation({
 *   firstName: { fieldName: "First name", minLength: 2, maxLength: 30 },
 *   lastName: { fieldName: "Last name", required: false },
 *   email: Yup.string().email().required(),
 * });
 */
export const createFormValidation = (fields = {}) => {
  const schemaFields = {};

  Object.keys(fields).forEach((fieldName) => {
    const config = fields[fieldName];
    
    // If config is already a Yup schema, use it directly
    if (config && typeof config.validate === 'function') {
      schemaFields[fieldName] = config;
    } else {
      // Otherwise, create name validation with the config
      schemaFields[fieldName] = createNameValidation({
        fieldName: fieldName.replace(/([A-Z])/g, ' $1').trim(),
        ...config,
      });
    }
  });

  return Yup.object().shape(schemaFields);
};

/**
 * Common validation schemas ready to use
 */
export const validationSchemas = {
  // Basic name form
  nameForm: Yup.object().shape({
    firstName: nameValidationSchemas.firstName,
    lastName: nameValidationSchemas.lastName,
  }),

  // Full name form
  fullNameForm: Yup.object().shape({
    fullName: nameValidationSchemas.fullName,
  }),
};

/**
 * Helper function to get Formik field props with validation
 * @param {Object} formik - Formik instance
 * @param {string} fieldName - Field name
 * @returns {Object} Props to spread on input field
 */
export const getFieldProps = (formik, fieldName) => ({
  name: fieldName,
  value: formik.values[fieldName] || '',
  onChange: formik.handleChange,
  onBlur: formik.handleBlur,
  error: formik.touched[fieldName] && formik.errors[fieldName],
});
