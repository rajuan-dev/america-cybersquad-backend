


export const  searchableFields=[
        "name",
        "email",
        "branchName",
        "className",
        "guardianName",
        "guardianPhone",
      ]

      export const searchableClassDistribution=[
        "classLevel",
        "assignableSubject",
        "day",
        "roomNumber",
      ]

      export const searchableClassMaterial=[
        "classLevel",
        "assignableSubject",
        "classDistributions.teacher.teacherName",
        "classDistributions.teacher.email",
        "classDistributions.teacher.teacherId"
      ]