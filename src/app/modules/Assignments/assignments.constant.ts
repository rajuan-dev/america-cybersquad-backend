

export const AssignmentType={
    HomeWork:"HomeWork",
    Practice:"Practice",
    Project:"Project",
    Quiz:"Quiz"
} as const;

export const searchableAssignment:string[]=[
        "assignmentTitle",
        "assignmentType",
      ];

      
      export const materialType={
        materialPDF:"pdf",
        materialWord:"word",
        materialVideo:"video",
        materialLink:"external_link"
        

      } as const ;
