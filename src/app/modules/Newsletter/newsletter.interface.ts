export interface INewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ICreateNewsletterSubscriber {
  email: string;
}

export interface INewsletterFilter {
  searchTerm?: string;
  isActive?: boolean;
}

export type INewsletterResponse = {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: INewsletterSubscriber[];
};
