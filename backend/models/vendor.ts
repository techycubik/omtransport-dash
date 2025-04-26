import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface Vendor extends Model<InferAttributes<Vendor>, InferCreationAttributes<Vendor>> {
  id?: number;
  name: string;
  contact?: string;
  gstNo?: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  maps_link?: string;
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
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    maps_link: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Vendors',
    underscored: false
  });

  return Vendor;
}; 