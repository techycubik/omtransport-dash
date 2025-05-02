import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export interface Dispatch extends Model<InferAttributes<Dispatch>, InferCreationAttributes<Dispatch>> {
  id?: number;
  crusherRunId: number;
  salesOrderId?: number;
  purchaseOrderId?: number;
  dispatchDate: Date;
  quantity: number;
  destination: string;
  vehicleNo: string;
  driver?: string;
  pickupQuantity?: number;
  dropQuantity?: number;
  deliveryStatus: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
  deliveryDuration?: number;
  notes?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const DispatchFactory = (sequelize: Sequelize) => {
  const Dispatch = sequelize.define<Dispatch>('Dispatch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    crusherRunId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    salesOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dispatchDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicleNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    driver: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pickupQuantity: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    dropQuantity: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    deliveryStatus: {
      type: DataTypes.ENUM('PENDING', 'IN_TRANSIT', 'DELIVERED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    deliveryDuration: {
      type: DataTypes.INTEGER, // In days
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Dispatches',
    underscored: true
  });

  return Dispatch;
};