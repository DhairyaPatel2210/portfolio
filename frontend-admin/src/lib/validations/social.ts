import * as yup from "yup";

export const socialSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  link: yup
    .string()
    .url("Please enter a valid URL")
    .required("Link is required"),
  icon: yup.string().required("Icon is required"),
});
