import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface SalesOrder extends Model<InferAttributes<SalesOrder>, InferCreationAttributes<SalesOrder>> {
  id?: number;
  customerId: number;
  vehicleNo?: string;
  challanNo?: string;
  address?: string;
  orderDate: Date;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const SalesOrderFactory = (sequelize: Sequelize) => {
  const SalesOrder = sequelize.define<SalesOrder>('SalesOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    vehicleNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    challanNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'SalesOrders',
    underscored: true
  });

  return SalesOrder;
}; 