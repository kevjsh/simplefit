import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';
import { IRole } from '../../interfaces/roles/role.interface';

export interface IRoleCreation extends Optional<IRole, 'CreatedAt'> {}
export interface IRoleInstance extends Model<IRole, IRoleCreation>, IRole {}

export const Roles = sequelize.define<IRoleInstance>('Roles', {
  Id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    primaryKey: true,
  },
  RoleType: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'Roles',
  timestamps: false,
});
