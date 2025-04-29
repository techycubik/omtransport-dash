"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
exports.default = initUserModel;
const sequelize_1 = require("sequelize");
// Define the role enum - Super Admin can manage other admins
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["STAFF"] = "STAFF";
})(UserRole || (exports.UserRole = UserRole = {}));
function initUserModel(sequelize) {
    const User = sequelize.define('User', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
            defaultValue: UserRole.STAFF
        },
        lastLogin: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: 'Users',
        timestamps: true,
        underscored: true, // Use snake_case for fields
    });
    return User;
}
