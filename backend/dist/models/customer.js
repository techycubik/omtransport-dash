"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerFactory = void 0;
const sequelize_1 = require("sequelize");
const CustomerFactory = (sequelize) => {
    const Customer = sequelize.define('Customer', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        gstNo: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'gst_no'
        },
        contact: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        street: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        city: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        state: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        pincode: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        maps_link: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'Customers',
        underscored: true
    });
    return Customer;
};
exports.CustomerFactory = CustomerFactory;
