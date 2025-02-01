export interface IconData {
  s3Link: string;
  s3Key: string;
}

export interface Social {
  _id?: string;
  name: string;
  link: string;
  lightIcon: IconData;
  darkIcon: IconData;
}

export type CreateSocialInput = Omit<Social, "_id">;
export type UpdateSocialInput = Partial<CreateSocialInput>;
