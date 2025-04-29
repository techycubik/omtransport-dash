"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesOrderFactory = void 0;
const sequelize_1 = require("sequelize");
const SalesOrderFactory = (sequelize) => {
    const SalesOrder = sequelize.define('SalesOrder', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        customerId: {
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
        vehicleNo: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        orderDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'SalesOrders',
        underscored: true
    });
    return SalesOrder;
};
exports.SalesOrderFactory = SalesOrderFactory;
