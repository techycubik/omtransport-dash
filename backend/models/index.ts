import { Sequelize, DataTypes } from 'sequelize';
import { CustomerFactory } from './customer';
import { VendorFactory } from './vendor';
import { MaterialFactory } from './material';
import { SalesOrderFactory } from './salesorder';
import { PurchaseOrderFactory } from './purchaseorder';
import { CrusherRunFactory } from './crusherrun';

export const initModels = (sequelize: Sequelize) => {
  const Customer = CustomerFactory(sequelize);
  const Vendor = VendorFactory(sequelize);
  const Material = MaterialFactory(sequelize);
  const SalesOrder = SalesOrderFactory(sequelize);
  const PurchaseOrder = PurchaseOrderFactory(sequelize);
  const CrusherRun = CrusherRunFactory(sequelize);

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

  return sequelize.models;
}; 