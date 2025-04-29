"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/request-otp', authController_1.requestOTP);
router.post('/verify-otp', authController_1.verifyOTP);
// Protected routes - Super Admin only
router.get('/admins', authMiddleware_1.isAuthenticated, authMiddleware_1.isSuperAdmin, authController_1.listAdmins);
router.post('/admins', authMiddleware_1.isAuthenticated, authMiddleware_1.isSuperAdmin, authController_1.createAdmin);
router.get('/users/:userId/activity', authMiddleware_1.isAuthenticated, authMiddleware_1.isSuperAdmin, authController_1.getUserActivity);
router.put('/users/:userId/deactivate', authMiddleware_1.isAuthenticated, authMiddleware_1.isSuperAdmin, authController_1.deactivateUser);
exports.default = router;
