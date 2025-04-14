import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface PurchaseOrder extends Model<InferAttributes<PurchaseOrder>, InferCreationAttributes<PurchaseOrder>> {
  id?: number;
  vendorId: number;
  materialId: number;
  qty: number;
  rate: number;
  status: 'PENDING' | 'RECEIVED' | 'PARTIAL';
  orderDate: Date;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const PurchaseOrderFactory = (sequelize: Sequelize) => {
  const PurchaseOrder = sequelize.define<PurchaseOrder>('PurchaseOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    qty: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'RECEIVED', 'PARTIAL'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'PurchaseOrders',
    underscored: true
  });

  return PurchaseOrder;
}; 