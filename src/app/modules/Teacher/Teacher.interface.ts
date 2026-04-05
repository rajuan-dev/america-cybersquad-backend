export interface Teacher {
  teacherName: string;
  email: string;
  phoneNumber: string;
  branchName: string;
  subject: string[];
  assignClass: string[];
  password: string;
  address: string;
  photo?: string; 
  isDeleted: boolean;
  subscriptionId: string;
 
}
