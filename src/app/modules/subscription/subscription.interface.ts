
export type SubscriptionType = "free_trial" | "paid";
export type SchoolArea = "Urban" | "Rural";


export interface ISubscriptionDetails {
  subscriptionType: SubscriptionType;
  schoolName: string;
  country: string;
  state: string;
  city: string;
  area: SchoolArea;
  schoolType: string;
  studentLimit: string;
}

export interface ISubscriptions {
  price: number;

  subscriptiondetails: ISubscriptionDetails[];
}