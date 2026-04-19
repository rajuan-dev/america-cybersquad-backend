import { UserRole, UserStatus } from "@prisma/client";

export type TUser = {
  name: string;
  email: string;
  password: string;
  country: string;
  city: string;
  role: UserRole;
  status: UserStatus;
  branches: number; 
};