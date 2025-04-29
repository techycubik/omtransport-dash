"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = exports.isAdmin = exports.isAuthenticated = void 0;
const models_1 = require("../models");
const user_1 = require("../../models/user");
require("../types"); // Import the Express type extensions
// Verify if user is authenticated
const isAuthenticated = async (req, res, next) => {
    try {
        // Get user ID from session or token (implementation depends on your auth system)
        // This is just a placeholder - replace with your actual auth mechanism
        const userIdStr = req.headers['user-id'];
        const userId = userIdStr ? parseInt(userIdStr) : undefined;
        if (!userId || isNaN(userId)) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Find user in database
        const user = await models_1.UserModel.findOne({
            where: { id: userId, isActive: true },
            attributes: ['id', 'email', 'role']
        });
        if (!user) {
            return res.status(401).json({ error: 'User not found or inactive' });
        }
        // Add user to request object - with non-null assertion for id since we found the user
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.isAuthenticated = isAuthenticated;
// Verify if user is an admin
const isAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== user_1.UserRole.ADMIN && req.user.role !== user_1.UserRole.SUPER_ADMIN)) {
        return res.status(403).json({ error: 'Admin permission required' });
    }
    next();
};
exports.isAdmin = isAdmin;
// Verify if user is a super admin
const isSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== user_1.UserRole.SUPER_ADMIN) {
        return res.status(403).json({ error: 'Super admin permission required' });
    }
    next();
};
exports.isSuperAdmin = isSuperAdmin;
