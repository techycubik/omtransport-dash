import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface Vendor extends Model<InferAttributes<Vendor>, InferCreationAttributes<Vendor>> {
  id?: number;
  name: string;
  contact?: string;
  gstNo?: string;
  address?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const VendorFactory = (sequelize: Sequelize) => {
  const Vendor = sequelize.define<Vendor>('Vendor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gstNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Vendors',
    underscored: false
  });

  return Vendor;
}; 