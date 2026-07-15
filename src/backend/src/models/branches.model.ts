import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { IBranches, IBranchesCreation } from '../interfaces/branches.interface';

export interface IBranchesInstance extends Model<IBranches, IBranchesCreation>, IBranches { }

export const Branches = sequelize.define<IBranchesInstance>('Branches', {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    Type: {
        type: DataTypes.ENUM('GYM', 'PROFESSIONAL'),
        allowNull: false,
    },
    Name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    ShortName: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    Telephone: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    Email: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    Direction: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    MapsLink: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    ImageLink: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    OpeningDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    Status: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
}, {
    tableName: 'Branches',
    timestamps: false,
});
