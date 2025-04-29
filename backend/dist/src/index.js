"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.app = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
require("./types"); // Import the types that extend Express Request
exports.app = (0, express_1.default)();
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false
});
// Initialize models and associations
const models = (0, models_1.initModels)(exports.sequelize);
// Import routes after models are initialized
const materialRoutes_1 = __importDefault(require("./routes/materialRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));
const salesOrderRoutes_1 = __importDefault(require("./routes/salesOrderRoutes"));
const purchaseOrderRoutes_1 = __importDefault(require("./routes/purchaseOrderRoutes"));
const crusherRunRoutes_1 = __importDefault(require("./routes/crusherRunRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const PORT = process.env.PORT || 4000;
// Middleware
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// CORS configuration
exports.app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Error handler middleware
exports.app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
});
// Routes
exports.app.use('/api/materials', materialRoutes_1.default);
exports.app.use('/api/customers', customerRoutes_1.default);
exports.app.use('/api/vendors', vendorRoutes_1.default);
exports.app.use('/api/sales', salesOrderRoutes_1.default);
exports.app.use('/api/purchases', purchaseOrderRoutes_1.default);
exports.app.use('/api/crusher', crusherRunRoutes_1.default);
exports.app.use('/auth', authRoutes_1.default);
exports.app.use('/api/reports', reportRoutes_1.default);
// Start server
async function startServer() {
    try {
        await exports.sequelize.authenticate();
        console.log('Database connection established successfully.');
        exports.app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}
startServer();
