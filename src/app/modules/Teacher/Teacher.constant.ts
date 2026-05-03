

export const searchableTeacherFields = ["teacherName", "email", "phoneNumber", "branchName"];
 export const teacherSearchableFields = [
      "classLevel",
      "roomNumber",
      "assignableSubject",
      "day",
    ];

    export const teacherFilterableFields =["name", "email", "studentId", "className"];


    export const attendanceStatus={
      present:"PRESENT", absent:"ABSENT"
    } as const;
    