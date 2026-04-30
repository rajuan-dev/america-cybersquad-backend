

export interface TFeesManagement {
     subscriptionId: string;
     totalFees: number;
    

     classLevel:string;
     paymentStatus: 'paid' | 'unpaid';
     isDelete: boolean;
}

export interface TStudentFees {
       studentId: string;
       paidAmount: number;
       
       isDeleted: boolean;
  
}