import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database';
import { IPermissions } from '../../interfaces/authorize/permissions.interface';

export interface IPermissionsInstance extends Model<IPermissions>, IPermissions { }

export const Permissions = sequelize.define<IPermissionsInstance>('Permissions', {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    PermissionKey: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'Permissions',
    timestamps: false,
});

