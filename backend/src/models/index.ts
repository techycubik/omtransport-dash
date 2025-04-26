import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import initUserModel from '../../models/user';
import initUserAuditLogModel from '../../models/userAuditLog';
import { Material } from '../../models/material';
import { Customer } from '../../models/customer';
import { Vendor } from '../../models/vendor';
import { SalesOrder } from '../../models/salesorder';
import { PurchaseOrder } from '../../models/purchaseorder';
import { CrusherRun } from '../../models/crusherrun';

// Load environment variables
dotenv.config();

// Initialize sequelize
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'omtransport',
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Initialize models
const UserModel = initUserModel(sequelize);
const UserAuditLogModel = initUserAuditLogModel(sequelize);

// Initialize existing models
const MaterialModel = sequelize.models.Material;
const CustomerModel = sequelize.models.Customer;
const VendorModel = sequelize.models.Vendor;
const SalesOrderModel = sequelize.models.SalesOrder;
const PurchaseOrderModel = sequelize.models.PurchaseOrder;
const CrusherRunModel = sequelize.models.CrusherRun;

// Define associations
UserModel.hasMany(UserAuditLogModel, {
  foreignKey: 'user_id',
  as: 'auditLogs'
});
UserAuditLogModel.belongsTo(UserModel, {
  foreignKey: 'user_id',
  as: 'user'
});

// Other model associations...
CustomerModel.hasMany(SalesOrderModel, {
  foreignKey: 'customer_id',
  as: 'salesOrders'
});
SalesOrderModel.belongsTo(CustomerModel, {
  foreignKey: 'customer_id',
  as: 'customer'
});

MaterialModel.hasMany(SalesOrderModel, {
  foreignKey: 'material_id',
  as: 'salesOrders'
});
SalesOrderModel.belongsTo(MaterialModel, {
  foreignKey: 'material_id',
  as: 'material'
});

VendorModel.hasMany(PurchaseOrderModel, {
  foreignKey: 'vendor_id',
  as: 'purchaseOrders'
});
PurchaseOrderModel.belongsTo(VendorModel, {
  foreignKey: 'vendor_id',
  as: 'vendor'
});

MaterialModel.hasMany(PurchaseOrderModel, {
  foreignKey: 'material_id',
  as: 'purchaseOrders'
});
PurchaseOrderModel.belongsTo(MaterialModel, {
  foreignKey: 'material_id',
  as: 'material'
});

MaterialModel.hasMany(CrusherRunModel, {
  foreignKey: 'material_id',
  as: 'crusherRuns'
});
CrusherRunModel.belongsTo(MaterialModel, {
  foreignKey: 'material_id',
  as: 'material'
});

// Export models and sequelize
export {
  sequelize,
  UserModel,
  UserAuditLogModel,
  MaterialModel,
  CustomerModel,
  VendorModel,
  SalesOrderModel,
  PurchaseOrderModel,
  CrusherRunModel
}; 