export type ProjectType = string;

export interface Project {
  _id?: string;
  title: string;
  description: string;
  programmingLanguages: string[];
  githubRepo: string;
  liveWebLink?: string;
  projectType: ProjectType[];
  iconImage: string;
  specialNote?: string;
  startDate: Date;
  endDate?: Date;
  currentlyWorking: boolean;
}
