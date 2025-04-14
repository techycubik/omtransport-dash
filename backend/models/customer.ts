import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface Customer extends Model<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
  id?: number;
  name: string;
  address?: string;
  gstNo?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const CustomerFactory = (sequelize: Sequelize) => {
  const Customer = sequelize.define<Customer>('Customer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gstNo: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Customers',
    underscored: true
  });

  return Customer;
}; 