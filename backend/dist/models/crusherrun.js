"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrusherRunFactory = void 0;
const sequelize_1 = require("sequelize");
const CrusherRunFactory = (sequelize) => {
    const CrusherRun = sequelize.define('CrusherRun', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        materialId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        producedQty: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false
        },
        dispatchedQty: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false
        },
        runDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'CrusherRuns',
        underscored: true
    });
    return CrusherRun;
};
exports.CrusherRunFactory = CrusherRunFactory;
