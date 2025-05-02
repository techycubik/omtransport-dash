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
  Customer.hasMany(SalesOrder, { foreignKey: 'customer_id' });
  SalesOrder.belongsTo(Customer, { foreignKey: 'customer_id' });

  Vendor.hasMany(PurchaseOrder, { foreignKey: 'vendor_id' });
  PurchaseOrder.belongsTo(Vendor, { foreignKey: 'vendor_id' });

  Material.hasMany(SalesOrder, { foreignKey: 'material_id' });
  Material.hasMany(PurchaseOrder, { foreignKey: 'material_id' });
  Material.hasMany(CrusherRun, { foreignKey: 'material_id' });

  SalesOrder.belongsTo(Material, { foreignKey: 'material_id' });
  PurchaseOrder.belongsTo(Material, { foreignKey: 'material_id' });
  CrusherRun.belongsTo(Material, { foreignKey: 'material_id' });

  // New associations
  CrusherMachine.hasMany(CrusherRun, { foreignKey: 'machine_id', as: 'CrusherRuns' });
  CrusherRun.belongsTo(CrusherMachine, { foreignKey: 'machine_id', as: 'Machine' });

  CrusherRun.hasMany(Dispatch, { foreignKey: 'crusher_run_id' });
  Dispatch.belongsTo(CrusherRun, { foreignKey: 'crusher_run_id' });

  SalesOrder.hasMany(Dispatch, { foreignKey: 'sales_order_id' });
  Dispatch.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', constraints: false });

  PurchaseOrder.hasMany(Dispatch, { foreignKey: 'purchase_order_id' });
  Dispatch.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', constraints: false });

  return sequelize.models;
};