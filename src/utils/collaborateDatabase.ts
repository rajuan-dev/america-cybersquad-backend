import prisma from "../shared/prisma";
import { UserStatus } from "@prisma/client";




export const collaborateDatabase = async (email: string) => {
  const collaborate = await prisma.$queryRaw<
    {
      id: string;
      name: string;
      email: string;
      role: string;
      type: string;
      verificationCode: number | null;
    }[]
  >`
    SELECT
      id,
      name,
      email,
      role::text AS role,
      'USER'::text AS type,
      "verificationCode"
    FROM users
    WHERE email = ${email}
      AND "isVerified" = true
      AND status = 'ACTIVE'

    UNION ALL

    SELECT
      id,
      "teacherName" AS name,
      email,
      role::text AS role,
      'TEACHER'::text AS type,
      NULL::int AS "verificationCode"
    FROM teachers
    WHERE email = ${email}

    UNION ALL

    SELECT
      id,
      name,
      email,
      role::text AS role,
      'STUDENT'::text AS type,
      NULL::int AS "verificationCode"
    FROM students
    WHERE email = ${email}

    UNION ALL

    SELECT
      id,
      name,
      email,
      role::text AS role,
      'STAFF'::text AS type,
      NULL::int AS "verificationCode"
    FROM staffs
    WHERE email = ${email}

    UNION ALL

    SELECT
      id,
      "fullName" AS name,
      "emailAddress" AS email,
      role::text AS role,
      'BRANCH_ADMIN'::text AS type,
      "verificationCode"
    FROM branchadmins
    WHERE "emailAddress" = ${email};
  `;



 return collaborate[0] ?? null;
};


export const collaborateVerificationDatabase = async (
  verificationCode: number
) => {
  const code = Number(verificationCode);

  const results = await prisma.$queryRaw<
    {
      id: string;
      name: string;
      email: string;
      role: string;
      type: string;
      verificationCode: number | null;
      updatedAt: Date;
    }[]
  >`
    SELECT
      id,
      name,
      email,
      role::text AS role,
      'USER'::text AS type,
      "verificationCode",
      "updatedAt"
    FROM users
    WHERE "verificationCode" = ${code}

    UNION ALL

    SELECT
      id,
      "teacherName" AS name,
      email,
      role::text AS role,
      'TEACHER'::text AS type,
      "verificationCode",
      "updatedAt"
    FROM teachers
    WHERE "verificationCode" = ${code}

    UNION ALL

    SELECT
      id,
      name,
      email,
      role::text AS role,
      'STUDENT'::text AS type,
      "verificationCode",
      "updatedAt"
    FROM students
    WHERE "verificationCode" = ${code}

    UNION ALL

    SELECT
      id,
      name,
      email,
      role::text AS role,
      'STAFF'::text AS type,
      "verificationCode",
      "updatedAt"
    FROM staffs
    WHERE "verificationCode" = ${code}

    UNION ALL

    SELECT
      id,
      "fullName" AS name,
      "emailAddress" AS email,
      role::text AS role,
      'BRANCH_ADMIN'::text AS type,
      "verificationCode",
      "updatedAt"
    FROM branchadmins
    WHERE "verificationCode" = ${code};
  `;

  return results[0] ?? null;
};