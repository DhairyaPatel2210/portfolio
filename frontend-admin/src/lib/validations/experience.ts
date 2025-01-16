import * as yup from "yup";

export const experienceSchema = yup.object().shape({
  role: yup
    .string()
    .trim()
    .min(2, "Role must be at least 2 characters")
    .max(100, "Role must be less than 100 characters")
    .required("Role is required"),
  company: yup
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters")
    .required("Company name is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().when("isCurrentJob", {
    is: false,
    then: (schema) => schema.required("End date is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  isCurrentJob: yup.boolean().default(false),
  responsibilities: yup
    .string()
    .trim()
    .min(10, "Responsibilities must be at least 10 characters")
    .max(2000, "Responsibilities must be less than 2000 characters")
    .required("Responsibilities are required"),
  technologies: yup
    .array()
    .of(yup.string())
    .min(1, "At least one technology is required")
    .required("Technologies are required"),
});
