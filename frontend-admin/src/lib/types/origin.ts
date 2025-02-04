export interface Origin {
  _id?: string;
  origin: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OriginFormValues {
  origin: string;
  description: string;
}
