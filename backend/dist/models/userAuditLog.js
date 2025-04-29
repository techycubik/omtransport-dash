"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = void 0;
exports.default = initUserAuditLogModel;
const sequelize_1 = require("sequelize");
// Define action enum
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
function initUserAuditLogModel(sequelize) {
    const UserAuditLog = sequelize.define('UserAuditLog', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            field: 'user_id'
        },
        action: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(AuditAction)),
            allowNull: false
        },
        entityType: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'entity_type'
        },
        entityId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'entity_id'
        },
        changes: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        ipAddress: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'ip_address'
        }
    }, {
        tableName: 'UserAuditLogs',
        timestamps: true,
        underscored: true
    });
    return UserAuditLog;
}
