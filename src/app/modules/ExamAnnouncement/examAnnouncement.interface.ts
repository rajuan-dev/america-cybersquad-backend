export interface TExamAnnouncement{

     examDate: Date,
     tipTapEditor : string;
      examName : string
      topic : string
      totalMarks: string     
      duration : string        
      instruction    : string    
     subscriptionId: string;
     classDistributionId: string;
     isDelete:boolean;
}

export interface TExamGrades {
     examAnnouncementId: string;
     studentId: string;
     totalMarks: number;
     marks: number;
     instructions: string;
      isDelete:boolean;
}