import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';
import { ICustomerCredentials } from '../../interfaces/customer.interface';

export interface ICustomerCredentialsCreation extends Optional<ICustomerCredentials, 'CustomerId'> { }

export interface ICustomerCredentialsInstance extends Model<ICustomerCredentials, ICustomerCredentialsCreation>, ICustomerCredentials { }

export const CustomerCredentials = sequelize.define<ICustomerCredentialsInstance>('CustomerCredentials', {
    CustomerId: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false,
    },
    Password: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    TempPassword: {
        type: DataTypes.STRING(5),
        allowNull: true,
    },
    UpdatedOn: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: 'CustomerCredentials',
    timestamps: false,
});
