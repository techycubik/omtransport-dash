"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = exports.list = void 0;
const index_1 = require("../index");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const zod_1 = require("zod");
const { Vendor } = index_1.sequelize.models;
const vendorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    gstNo: zod_1.z.string().min(1, 'GST No is required'),
    contact: zod_1.z.string().min(1, 'Contact is required'),
    address: zod_1.z.string().optional()
});
exports.list = (0, asyncHandler_1.default)(async (req, res) => {
    const vendors = await Vendor.findAll();
    res.json(vendors);
});
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = vendorSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed', details: validationResult.error });
        return;
    }
    try {
        const data = validationResult.data;
        const vendor = await Vendor.create(data);
        res.status(201).json(vendor);
    }
    catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({ error: 'Failed to create vendor', details: error });
    }
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = vendorSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed', details: validationResult.error });
        return;
    }
    const { id } = req.params;
    const data = validationResult.data;
    try {
        const vendor = await Vendor.findByPk(id);
        if (!vendor) {
            res.status(404).json({ error: 'Vendor not found' });
            return;
        }
        await vendor.update(data);
        res.json(vendor);
    }
    catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ error: 'Failed to update vendor', details: error });
    }
});
