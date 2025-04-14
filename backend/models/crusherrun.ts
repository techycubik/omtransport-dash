import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface CrusherRun extends Model<InferAttributes<CrusherRun>, InferCreationAttributes<CrusherRun>> {
  id?: number;
  materialId: number;
  producedQty: number;
  dispatchedQty: number;
  runDate: Date;
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
    producedQty: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    dispatchedQty: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    runDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'CrusherRuns',
    underscored: true
  });

  return CrusherRun;
}; 