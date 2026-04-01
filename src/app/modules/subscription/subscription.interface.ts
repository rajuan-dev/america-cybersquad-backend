export interface ISubscriptions {
  studentLimit: number;
  price: number;
  subscriptiondetails?: ISubscriptionDetails[];
}

export interface ISubscriptionDetails {
  branchName: string;
  locationContext: string;
  subscriptionId: string;
  student: number;
  state: string;
  region: string;
  province: string;
  city: string;
  subscription?: ISubscriptions;
}