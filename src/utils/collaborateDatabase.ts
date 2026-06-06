import prisma from "../shared/prisma";

const collaborateDatabase = async (email: string) => {
  const collaborate = await prisma.$queryRaw<
    {
      id: string;
      name: string;
      email: string;
      role: string;
      type: string;
    }[]
  >`
    SELECT
      id,
      name,
      email,
      role,
      'USER' AS type
    FROM users
    WHERE email = ${email}

    UNION ALL

    SELECT
      id,
      "teacherName" AS name,
      email,
      role,
      'TEACHER' AS type
    FROM teachers
    WHERE email = ${email}

    UNION ALL

    SELECT
      id,
      name,
      email,
      role,
      'STUDENT' AS type
    FROM students
    WHERE email = ${email}

    UNION ALL

    SELECT
      id,
      name,
      email,
      role,
      'STAFF' AS type
    FROM staffs
    WHERE email = ${email};
  `;

  return collaborate;
};

export default collaborateDatabase;