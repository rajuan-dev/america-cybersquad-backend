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


export type AttendanceStatus = "PRESENT" | "ABSENT";
export interface StudentAttendance {
  studentId: string;
  attendanceStatus: AttendanceStatus;
}
export interface RecordAttendancePayload {
  attendanceDate: string; // ISO string থেকে Date বানাবো
  teacherId: string;
  subscriptionId: string;

  students: StudentAttendance[];
}