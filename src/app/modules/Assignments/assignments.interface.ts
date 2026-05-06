export interface TAssignments {
assignmentTitle: String;
classLevel:String;
assignmentType: "HomeWork"  | "Practice" | "Project" | "Quiz";
assignmentDueDate: Date;
description: String;
attachmentFiles: string;
isDelete?: boolean;
}