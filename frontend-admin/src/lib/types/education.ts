export interface Education {
  _id?: string;
  universityName: string;
  major: string;
  degree: string;
  startDate: string;
  endDate?: string;
  isPursuing: boolean;
  relatedCourseworks: string[];
  gpa: string;
}

export interface EducationResponse {
  educations: Education[];
}

export interface CreateEducationResponse {
  education: Education;
}

export interface UpdateEducationResponse {
  education: Education;
}
