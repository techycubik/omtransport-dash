"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialFactory = void 0;
const sequelize_1 = require("sequelize");
const MaterialFactory = (sequelize) => {
    const Material = sequelize.define('Material', {
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        uom: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'Materials'
    });
    return Material;
};
exports.MaterialFactory = MaterialFactory;
