import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database';
import { IRolePermissions } from '../../interfaces/authorize/rolePermissions.interface';
import { Roles } from '../roles/role.model';
import { Permissions } from './permissions.model';

export interface IRolePermissionsInstance extends Model<IRolePermissions>, IRolePermissions { }

export const RolePermissions = sequelize.define<IRolePermissionsInstance>('RolePermissions', {
    RoleId: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false,
    },
    PermissionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
}, {
    tableName: 'RolePermissions',
    timestamps: false,
});

// Define associations
RolePermissions.belongsTo(Roles, { foreignKey: 'RoleId', as: 'role' });
RolePermissions.belongsTo(Permissions, { foreignKey: 'PermissionId', as: 'permission' });

