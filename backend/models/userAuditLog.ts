import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

// Define action enum
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT'
}

export interface UserAuditLog extends Model<InferAttributes<UserAuditLog>, InferCreationAttributes<UserAuditLog>> {
  id?: number;
  userId: number;
  action: AuditAction;
  entityType?: string;
  entityId?: number;
  changes?: object;
  ipAddress?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export default function initUserAuditLogModel(sequelize: Sequelize) {
  const UserAuditLog = sequelize.define<UserAuditLog>('UserAuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      field: 'user_id'
    },
    action: {
      type: DataTypes.ENUM(...Object.values(AuditAction)),
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'entity_type'
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'entity_id'
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ip_address'
    }
  }, {
    tableName: 'UserAuditLogs',
    timestamps: true,
    underscored: true
  });

  return UserAuditLog;
} 