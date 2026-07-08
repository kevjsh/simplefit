import { IRole } from './role.interface';

export interface IUserRole {
  Id: string;
  CustomerId: string;
  RoleId: string;
  GymId: number;
  AssignedBy: string;
  AssignedAt: Date;
  Status: string;
  Role?: IRole;
}
