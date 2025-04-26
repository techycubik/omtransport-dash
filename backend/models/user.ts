import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

// Define the role enum - Super Admin can manage other admins
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export interface User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  id?: number;
  email: string;
  name?: string;
  role: UserRole;
  lastLogin?: Date;
  isActive: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export default function initUserModel(sequelize: Sequelize) {
  const User = sequelize.define<User>('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.STAFF
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'Users',
    timestamps: true,
    underscored: true, // Use snake_case for fields
  });

  return User;
} 