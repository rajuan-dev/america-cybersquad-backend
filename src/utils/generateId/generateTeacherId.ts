




import prisma from "../../shared/prisma";

const teacherRolePrefix = {
  TEACHER: "T"
  
} as const;

const generateTeacherId = async(role: keyof typeof  teacherRolePrefix, email: string) => {
  const prefix =  teacherRolePrefix[role];
  const now = new Date();

  const yearFull = now.getFullYear();
  const year = yearFull.toString().slice(-2);

  const month = String(now.getMonth() + 1);

  const orgCode = `${year}${month}`;
  const startOfYear = new Date(yearFull, 0, 1);
  const endOfYear = new Date(yearFull, 11, 31, 23, 59, 59);
  const count = await prisma.teacher.count({
    where: {
      email,
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });

  const serial = String(count + 1).padStart(3, "0");

  return `${prefix}-${orgCode}-${year}-${serial}`;
  
}

export default generateTeacherId



