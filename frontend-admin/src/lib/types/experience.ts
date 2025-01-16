export interface Experience {
  _id?: string;
  role: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrentJob: boolean;
  responsibilities: string;
  technologies: string[];
}

export interface ExperienceResponse {
  experiences: Experience[];
}

export interface CreateExperienceResponse {
  experience: Experience;
}

export interface UpdateExperienceResponse {
  experience: Experience;
}
