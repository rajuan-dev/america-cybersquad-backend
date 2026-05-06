
type AssignmentType= "HomeWork"  | "Practice" | "Project" | "Quiz";
export type TAssignments = {
  assignmentTitle: string;
  assignmentType: AssignmentType;
  assignmentDueDate: Date;
  description: string;
  attachmentFiles: string[];
  classDistributionId: string;   // ✅ must be string
  subscriptionId: string;        // ✅ must be string
};