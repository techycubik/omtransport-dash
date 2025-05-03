import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface CrusherSiteMaterial extends Model<InferAttributes<CrusherSiteMaterial>, InferCreationAttributes<CrusherSiteMaterial>> {
  crusher_site_id: number;
  material_id: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const CrusherSiteMaterialFactory = (sequelize: Sequelize) => {
  const CrusherSiteMaterial = sequelize.define<CrusherSiteMaterial>('CrusherSiteMaterial', {
    crusher_site_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'CrusherSites',
        key: 'id'
      },
      onDelete: 'CASCADE',
      field: 'crusher_site_id'
    },
    material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Materials',
        key: 'id'
      },
      onDelete: 'CASCADE',
      field: 'material_id'
    }
  }, {
    tableName: 'CrusherSiteMaterials',
    underscored: true
  });

  return CrusherSiteMaterial;
}; 