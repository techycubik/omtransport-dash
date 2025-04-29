"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderFactory = void 0;
const sequelize_1 = require("sequelize");
const PurchaseOrderFactory = (sequelize) => {
    const PurchaseOrder = sequelize.define('PurchaseOrder', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        vendorId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        materialId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        qty: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false
        },
        rate: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('PENDING', 'RECEIVED', 'PARTIAL'),
            allowNull: false,
            defaultValue: 'PENDING'
        },
        orderDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'PurchaseOrders',
        underscored: true
    });
    return PurchaseOrder;
};
exports.PurchaseOrderFactory = PurchaseOrderFactory;
