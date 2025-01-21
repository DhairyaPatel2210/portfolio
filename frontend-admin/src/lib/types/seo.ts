export interface SEO {
  _id?: string;
  title: string;
  description: string;
  keywords: string[];
  image?: string | null;
}

export interface SEOResponse {
  seo: {
    title: string;
    description: string;
    keywords: string[];
    image?: {
      s3Key: string;
      s3Url: string;
    };
  };
}
