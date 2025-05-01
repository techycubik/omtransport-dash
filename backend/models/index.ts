import { Sequelize, DataTypes } from 'sequelize';
import { CustomerFactory } from './customer';
import { VendorFactory } from './vendor';
import { MaterialFactory } from './material';
import { SalesOrderFactory } from './salesorder';
import { PurchaseOrderFactory } from './purchaseorder';
import { CrusherRunFactory } from './crusherrun';
import { CrusherMachineFactory } from './crusherMachine';
import { DispatchFactory } from './dispatch';

export const initModels = (sequelize: Sequelize) => {
  const Customer = CustomerFactory(sequelize);
  const Vendor = VendorFactory(sequelize);
  const Material = MaterialFactory(sequelize);
  const SalesOrder = SalesOrderFactory(sequelize);
  const PurchaseOrder = PurchaseOrderFactory(sequelize);
  const CrusherRun = CrusherRunFactory(sequelize);
  const CrusherMachine = CrusherMachineFactory(sequelize);
  const Dispatch = DispatchFactory(sequelize);

  // Set up associations
  Customer.hasMany(SalesOrder);
  SalesOrder.belongsTo(Customer);

  Vendor.hasMany(PurchaseOrder);
  PurchaseOrder.belongsTo(Vendor);

  Material.hasMany(SalesOrder);
  Material.hasMany(PurchaseOrder);
  Material.hasMany(CrusherRun);

  SalesOrder.belongsTo(Material);
  PurchaseOrder.belongsTo(Material);
  CrusherRun.belongsTo(Material);

  // New associations
  CrusherMachine.hasMany(CrusherRun);
  CrusherRun.belongsTo(CrusherMachine);

  CrusherRun.hasMany(Dispatch);
  Dispatch.belongsTo(CrusherRun);

  SalesOrder.hasMany(Dispatch);
  Dispatch.belongsTo(SalesOrder, { foreignKey: 'salesOrderId', constraints: false });

  return sequelize.models;
};