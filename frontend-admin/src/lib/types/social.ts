export interface Social {
  _id?: string;
  name: string;
  link: string;
  icon: string;
  s3Link?: string;
}

export type CreateSocialInput = Omit<Social, "_id">;
export type UpdateSocialInput = Partial<CreateSocialInput>;
