"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = exports.list = void 0;
const index_1 = require("../index");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const zod_1 = require("zod");
const { Customer } = index_1.sequelize.models;
// Check if the field mappings are correct
console.log('Customer model:', Customer);
const customerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    address: zod_1.z.string().optional(),
    gstNo: zod_1.z.string().optional(),
    contact: zod_1.z.string().optional()
});
exports.list = (0, asyncHandler_1.default)(async (req, res) => {
    const customers = await Customer.findAll();
    res.json(customers);
});
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = customerSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed', details: validationResult.error });
        return;
    }
    try {
        const data = validationResult.data;
        const customer = await Customer.create(data);
        res.status(201).json(customer);
    }
    catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Failed to create customer', details: error });
    }
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = customerSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed', details: validationResult.error });
        return;
    }
    const { id } = req.params;
    const data = validationResult.data;
    try {
        const customer = await Customer.findByPk(id);
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        await customer.update(data);
        res.json(customer);
    }
    catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Failed to update customer', details: error });
    }
});
