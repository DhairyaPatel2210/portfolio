import * as yup from "yup";

export const seoSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .min(1, "Title must have more than 1 character")
    .max(30, "Title must be less than 60 characters")
    .required("Title is required"),
  description: yup
    .string()
    .trim()
    .min(1, "Description must have more than 1 character")
    .max(60, "Description must be less than 160 characters")
    .required("Description is required"),
  keywords: yup
    .array()
    .of(yup.string())
    .min(5, "At least 5 keywords are required")
    .required("Keywords are required"),
  image: yup.string().required("Image is required"),
});
