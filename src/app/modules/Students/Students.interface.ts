

export interface CreateStudentDto {
  name: string;
  email: string;
  branchName: string;
  className : string;
 guardianName: string;
 guardianPhone: string;
 password: string;
 verificationCode: number;
 isVerified: boolean;
 branchAdminId: string;
 subscriptionId: string;
 photo: string;
 isDeleted: boolean;


}

type TUploadFiles = {
  fileUrl: string
}

export interface TSubmitAssignment{
  classAssignmentId: string;
  submitAssignmentId?: string;
  
  uploadFiles: TUploadFiles[];
  isDeleted: boolean;
}