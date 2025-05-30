import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface Material extends Model<InferAttributes<Material>, InferCreationAttributes<Material>> {
  id?: number;
  name: string;
  uom: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const MaterialFactory = (sequelize: Sequelize) => {
  const Material = sequelize.define<Material>('Material', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'Materials'
  });

  return Material;
}; 