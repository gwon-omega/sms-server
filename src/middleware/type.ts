import { Request } from "express";

export enum UserRole {
  Teacher = "teacher",
  Institute = "institute",
  SuperAdmin = "super-admin",
  Student = "student",
}

export interface IExtendedRequest extends Request {
  user?: {
    id: string;
    currentInstituteNumber?: string | number | null;
    currentInstituteId?: string | null;
    role: UserRole;
  };
}
