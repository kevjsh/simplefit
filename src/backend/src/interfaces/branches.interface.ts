import { Optional } from 'sequelize';

export interface IBranches {
  Id: string;
  Type: string;
  Name: string;
  ShortName: string;
  Telephone: string;
  Email: string;
  Direction: string;
  MapsLink: string;
  ImageLink: string;
  Description: string;
  OpeningDate: Date;
  Status: string;
}

export interface IBranchesCreation extends Optional<IBranches, 'Id'> { }
