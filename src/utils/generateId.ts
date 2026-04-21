import prisma from "../shared/prisma";

const staffRolePrefix = {
  parent: "P",
  nurse: "N",
  bursar: "B",
} as const;

const generateId = async (role: keyof typeof staffRolePrefix) => {
  const prefix = staffRolePrefix[role];

  const year = new Date().getFullYear().toString().slice(-2);

  const orgCode = Math.floor(100 + Math.random() * 900);
  const count = await prisma.staff.count({
    where: {
      role,
    },
  });

  const serial = String(count + 1).padStart(3, "0");

  return `${prefix}-${orgCode}-${year}-${serial}`;
};

export default  generateId;

