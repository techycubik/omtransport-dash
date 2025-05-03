import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface SalesOrderItem extends Model<InferAttributes<SalesOrderItem>, InferCreationAttributes<SalesOrderItem>> {
  id?: number;
  salesOrderId: number;
  materialId: number;
  crusherSiteId?: number;
  qty: number;
  rate: number;
  uom: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const SalesOrderItemFactory = (sequelize: Sequelize) => {
  const SalesOrderItem = sequelize.define<SalesOrderItem>('SalesOrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    salesOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    crusherSiteId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    qty: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Ton'
    }
  }, {
    tableName: 'SalesOrderItems',
    underscored: true
  });

  return SalesOrderItem;
}; 