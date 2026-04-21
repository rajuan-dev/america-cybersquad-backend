import prisma from "../shared/prisma";

const staffRolePrefix = {
  parent: "P",
  nurse: "N",
  bursar: "B",
} as const;

const generateId = async (role: keyof typeof staffRolePrefix) => {
  const prefix = staffRolePrefix[role];
  const now = new Date();

  const yearFull = now.getFullYear();
  const year = yearFull.toString().slice(-2);

  const month = String(now.getMonth() + 1);

  const orgCode = `${year}${month}`;
  const startOfYear = new Date(yearFull, 0, 1);
  const endOfYear = new Date(yearFull, 11, 31, 23, 59, 59);
  const count = await prisma.staff.count({
    where: {
      role,
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });

  const serial = String(count + 1).padStart(3, "0");

  return `${prefix}-${orgCode}-${year}-${serial}`;
};

export default generateId;