

export interface TFeesManagement {
     subscriptionId: string;
     totalFees: number;
     paidAmount: number;
     unpaidAmount:number;
     classLevel:string;
     paymentStatus: 'paid' | 'unpaid';
     isDelete: boolean;
}