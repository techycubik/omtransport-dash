import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface CrusherSite extends Model<InferAttributes<CrusherSite>, InferCreationAttributes<CrusherSite>> {
  id?: number;
  name: string;
  owner: string;
  location: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const CrusherSiteFactory = (sequelize: Sequelize) => {
  const CrusherSite = sequelize.define<CrusherSite>('CrusherSite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'CrusherSites',
    underscored: true
  });

  return CrusherSite;
}; 