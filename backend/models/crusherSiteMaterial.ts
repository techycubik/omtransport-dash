import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface CrusherSiteMaterial extends Model<InferAttributes<CrusherSiteMaterial>, InferCreationAttributes<CrusherSiteMaterial>> {
  crusherSiteId: number;
  materialId: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const CrusherSiteMaterialFactory = (sequelize: Sequelize) => {
  const CrusherSiteMaterial = sequelize.define<CrusherSiteMaterial>('CrusherSiteMaterial', {
    crusherSiteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'crusher_site_id',
      references: {
        model: 'CrusherSites',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'material_id',
      references: {
        model: 'Materials',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'CrusherSiteMaterials',
    underscored: true
  });

  return CrusherSiteMaterial;
}; 