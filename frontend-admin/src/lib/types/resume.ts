export interface Resume {
  _id: string;
  fileName: string;
  displayName: string;
  s3Url: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeResponse {
  resumes: Resume[];
  message: string;
}

// Add this to your resume.ts
export interface UploadResumeResponse {
  message: string;
  resume: Resume;
}
