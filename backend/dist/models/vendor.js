"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorFactory = void 0;
const sequelize_1 = require("sequelize");
const VendorFactory = (sequelize) => {
    const Vendor = sequelize.define('Vendor', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        contact: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        gstNo: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        address: {
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
        tableName: 'Vendors',
        underscored: false
    });
    return Vendor;
};
exports.VendorFactory = VendorFactory;
