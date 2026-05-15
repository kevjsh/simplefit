import { IUserRole } from './roles/user.role.interface';

export interface ICustomer {
  Id: string;
  NID: string;
  Name: string;
  FirstLastName: string;
  SecondLastName: string;
  Birthday: Date;
  Gender: string;
  FirstTelephone: number;
  SecondTelephone: number;
  Address: string;
  Email: string;
  Details: string;
  ProfilePicture: string;
  RegistrationDate: Date;
  LastLogin: Date;
  Status: string;
  UserRoles?: IUserRole[];
}

export interface ICustomerCredentials {
  CustomerId: string;
  Password: string;
  TempPassword: string | null;
  UpdatedOn: Date;
}

export interface ISignupData {
  NID: string;
  Name: string;
  FirstLastName: string;
  SecondLastName: string;
  Birthday: string;
  Gender: string;
  FirstTelephone: string;
  SecondTelephone?: string;
  Address: string;
  Email: string;
}