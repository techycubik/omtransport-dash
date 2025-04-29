"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrusherRunModel = exports.PurchaseOrderModel = exports.SalesOrderModel = exports.VendorModel = exports.CustomerModel = exports.MaterialModel = exports.UserAuditLogModel = exports.UserModel = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("../../models/user"));
const userAuditLog_1 = __importDefault(require("../../models/userAuditLog"));
// Load environment variables
dotenv_1.default.config();
// Initialize sequelize
const sequelize = new sequelize_1.Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'omtransport',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
});
exports.sequelize = sequelize;
// Initialize models
const UserModel = (0, user_1.default)(sequelize);
exports.UserModel = UserModel;
const UserAuditLogModel = (0, userAuditLog_1.default)(sequelize);
exports.UserAuditLogModel = UserAuditLogModel;
// Define User associations
UserModel.hasMany(UserAuditLogModel, {
    foreignKey: 'user_id',
    as: 'auditLogs'
});
UserAuditLogModel.belongsTo(UserModel, {
    foreignKey: 'user_id',
    as: 'user'
});
// Initialize existing models safely
const MaterialModel = sequelize.models.Material;
exports.MaterialModel = MaterialModel;
const CustomerModel = sequelize.models.Customer;
exports.CustomerModel = CustomerModel;
const VendorModel = sequelize.models.Vendor;
exports.VendorModel = VendorModel;
const SalesOrderModel = sequelize.models.SalesOrder;
exports.SalesOrderModel = SalesOrderModel;
const PurchaseOrderModel = sequelize.models.PurchaseOrder;
exports.PurchaseOrderModel = PurchaseOrderModel;
const CrusherRunModel = sequelize.models.CrusherRun;
exports.CrusherRunModel = CrusherRunModel;
// Define other associations only if models exist
if (CustomerModel && SalesOrderModel) {
    CustomerModel.hasMany(SalesOrderModel, {
        foreignKey: 'customer_id',
        as: 'salesOrders'
    });
    SalesOrderModel.belongsTo(CustomerModel, {
        foreignKey: 'customer_id',
        as: 'customer'
    });
}
if (MaterialModel && SalesOrderModel) {
    MaterialModel.hasMany(SalesOrderModel, {
        foreignKey: 'material_id',
        as: 'salesOrders'
    });
    SalesOrderModel.belongsTo(MaterialModel, {
        foreignKey: 'material_id',
        as: 'material'
    });
}
if (VendorModel && PurchaseOrderModel) {
    VendorModel.hasMany(PurchaseOrderModel, {
        foreignKey: 'vendor_id',
        as: 'purchaseOrders'
    });
    PurchaseOrderModel.belongsTo(VendorModel, {
        foreignKey: 'vendor_id',
        as: 'vendor'
    });
}
if (MaterialModel && PurchaseOrderModel) {
    MaterialModel.hasMany(PurchaseOrderModel, {
        foreignKey: 'material_id',
        as: 'purchaseOrders'
    });
    PurchaseOrderModel.belongsTo(MaterialModel, {
        foreignKey: 'material_id',
        as: 'material'
    });
}
if (MaterialModel && CrusherRunModel) {
    MaterialModel.hasMany(CrusherRunModel, {
        foreignKey: 'material_id',
        as: 'crusherRuns'
    });
    CrusherRunModel.belongsTo(MaterialModel, {
        foreignKey: 'material_id',
        as: 'material'
    });
}
