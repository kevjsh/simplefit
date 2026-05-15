import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';
import { ICustomer } from '../../interfaces/customer.interface';

export interface ICustomerCreation extends Optional<ICustomer, 'Id'> { }

export interface ICustomerInstance extends Model<ICustomer, ICustomerCreation>, ICustomer { }

export const Customers = sequelize.define<ICustomerInstance>('Customers', {
    Id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false,
    },
    NID: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    Name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    FirstLastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    SecondLastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    Birthday: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    Gender: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    FirstTelephone: {
        type: DataTypes.STRING(8),
        allowNull: false,
    },
    SecondTelephone: {
        type: DataTypes.STRING(8),
        allowNull: true,
    },
    Address: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    Email: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    Details: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    ProfilePicture: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    RegistrationDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    LastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    Status: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
}, {
    tableName: 'Customers',
    timestamps: false,
});
