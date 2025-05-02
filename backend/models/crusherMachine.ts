import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface CrusherMachine extends Model<InferAttributes<CrusherMachine>, InferCreationAttributes<CrusherMachine>> {
  id?: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  lastMaintenanceDate: Date;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const CrusherMachineFactory = (sequelize: Sequelize) => {
  const CrusherMachine = sequelize.define<CrusherMachine>('CrusherMachine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE'),
      allowNull: false,
      defaultValue: 'ACTIVE'
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_maintenance_date'
    }
  }, {
    tableName: 'CrusherMachines',
    underscored: true
  });

  return CrusherMachine;
};