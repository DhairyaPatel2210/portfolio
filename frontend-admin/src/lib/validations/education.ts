import * as yup from "yup";

export const educationSchema = yup.object().shape({
  universityName: yup
    .string()
    .trim()
    .min(2, "University name must be at least 2 characters")
    .max(100, "University name must be less than 100 characters")
    .required("University name is required"),
  major: yup
    .string()
    .trim()
    .min(2, "Major must be at least 2 characters")
    .max(100, "Major must be less than 100 characters")
    .required("Major is required"),
  degree: yup
    .string()
    .trim()
    .min(2, "Degree must be at least 2 characters")
    .max(100, "Degree must be less than 100 characters")
    .required("Degree is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().when("isPursuing", {
    is: false,
    then: (schema) => schema.required("End date is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  isPursuing: yup.boolean().default(false),
  relatedCourseworks: yup
    .array()
    .of(yup.string())
    .min(1, "At least one coursework is required")
    .required("Related courseworks are required"),
  gpa: yup
    .string()
    .trim()
    .matches(/^\d*\.?\d*$/, "GPA must be a valid number")
    .test("gpa", "GPA must be between 0 and 4", (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 4;
    })
    .required("GPA is required"),
});
