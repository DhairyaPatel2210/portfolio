import * as Yup from "yup";

export const projectSchema = Yup.object().shape({
  title: Yup.string().required("Project title is required"),
  description: Yup.string().required("Description is required"),
  programmingLanguages: Yup.array()
    .of(Yup.string())
    .min(1, "At least one programming language is required"),
  githubRepo: Yup.string()
    .required("GitHub repository link is required")
    .url("Please enter a valid URL"),
  liveWebLink: Yup.string().url("Please enter a valid URL").nullable(),
  projectType: Yup.array()
    .of(Yup.string())
    .min(1, "At least one project type is required"),
  iconImage: Yup.string().required("Project icon is required"),
  specialNote: Yup.string().nullable(),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date()
    .nullable()
    .when("currentlyWorking", {
      is: false,
      then: (schema) =>
        schema.required("End date is required when not currently working"),
    }),
  currentlyWorking: Yup.boolean(),
});
