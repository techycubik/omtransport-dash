import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface CrusherRun extends Model<InferAttributes<CrusherRun>, InferCreationAttributes<CrusherRun>> {
  id?: number;
  materialId: number;
  machineId: number;
  inputQty: number;
  producedQty: number;
  dispatchedQty: number;
  runDate: Date;
  status: 'PENDING' | 'COMPLETED' | 'PARTIALLY_DISPATCHED' | 'FULLY_DISPATCHED';
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const CrusherRunFactory = (sequelize: Sequelize) => {
  const CrusherRun = sequelize.define<CrusherRun>('CrusherRun', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    machineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'machine_id'
    },
    inputQty: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'input_qty'
    },
    producedQty: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    dispatchedQty: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'PARTIALLY_DISPATCHED', 'FULLY_DISPATCHED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    runDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'CrusherRuns',
    underscored: false
  });

  return CrusherRun;
};