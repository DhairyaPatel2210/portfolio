import * as yup from "yup";

const svgValidation = yup
  .string()
  .test(
    "is-svg",
    "Only SVG images are allowed",
    (value) => !value || value.startsWith("data:image/svg+xml;base64,")
  );

export const socialSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  link: yup
    .string()
    .url("Please enter a valid URL")
    .required("Link is required"),
  lightIcon: svgValidation.required("Light theme icon is required"),
  darkIcon: svgValidation.required("Dark theme icon is required"),
});
