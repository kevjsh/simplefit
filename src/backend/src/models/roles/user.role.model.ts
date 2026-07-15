import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';
import { IUserRole } from '../../interfaces/roles/user.role.interface';
import { Roles } from './role.model';
import { Customers } from '../customers/customer.model';

export interface IUserRoleCreation extends Optional<IUserRole, 'AssignedAt'> { }
export interface IUserRoleInstance extends Model<IUserRole, IUserRoleCreation>, IUserRole { }

export const UserRoles = sequelize.define<IUserRoleInstance>('UserRoles', {
  Id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  CustomerId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  RoleId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  BranchId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
  },
  AssignedBy: {
    type: DataTypes.CHAR(36),
    allowNull: false
  },
  AssignedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  Status: {
    type: DataTypes.STRING(20),
    allowNull: false,
  }
}, {
  tableName: 'UserRoles',
  timestamps: false,
});

// Define associations - UserRole will include Role and Customer through associations
UserRoles.belongsTo(Roles, { foreignKey: 'RoleId', as: 'Role' });
UserRoles.belongsTo(Customers, { foreignKey: 'CustomerId', as: 'Customer' });
