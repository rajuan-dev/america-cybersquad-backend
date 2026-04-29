

export interface TFeesManagement {
     subscriptionId: string;
     totalFees: number;
    

     classLevel:string;
     paymentStatus: 'paid' | 'unpaid';
     isDelete: boolean;
}

export interface TStudentFees {
       studentId: string;
       totalAmount: number;
       totalPaid: number;
       remainingAmount: number;
       dueDate: Date;
       isPaid: boolean;
       isDeleted: boolean;
  
}