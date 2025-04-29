"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.list = void 0;
const index_1 = require("../index");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const zod_1 = require("zod");
const { SalesOrder, Customer, Material } = index_1.sequelize.models;
const salesOrderSchema = zod_1.z.object({
    customerId: zod_1.z.number().int().positive('Customer ID must be positive'),
    materialId: zod_1.z.number().int().positive('Material ID must be positive'),
    qty: zod_1.z.number().positive('Quantity must be positive'),
    rate: zod_1.z.number().positive('Rate must be positive'),
    vehicleNo: zod_1.z.string().optional().transform(val => val === '' ? undefined : val),
    orderDate: zod_1.z.string().datetime('Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)')
});
exports.list = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        // Verify the associations exist
        if (!Customer || !Material) {
            return res.status(500).json({
                error: 'Database models not properly initialized. Missing Customer or Material model.'
            });
        }
        // Use correct include syntax without alias
        const salesOrders = await SalesOrder.findAll({
            include: [
                {
                    model: Customer,
                    attributes: ['id', 'name', 'address', 'gstNo', 'contact']
                },
                {
                    model: Material,
                    attributes: ['id', 'name', 'uom']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return res.json(salesOrders);
    }
    catch (error) {
        console.error('Error fetching sales orders:', error);
        return res.status(500).json({
            error: 'Failed to fetch sales orders',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    console.log('Request body:', req.body);
    try {
        const validationResult = salesOrderSchema.safeParse(req.body);
        if (!validationResult.success) {
            console.error('Validation error:', validationResult.error.format());
            return res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.format()
            });
        }
        const { customerId, materialId, qty, rate, vehicleNo, orderDate } = validationResult.data;
        const salesOrder = await SalesOrder.create({
            customerId,
            materialId,
            qty,
            rate,
            vehicleNo,
            orderDate
        });
        // Fetch the created order with its relations for the response
        const newOrderWithRelations = await SalesOrder.findByPk(salesOrder.id, {
            include: [
                { model: Customer },
                { model: Material }
            ]
        });
        res.status(201).json(newOrderWithRelations);
    }
    catch (error) {
        console.error('Error creating sales order:', error);
        res.status(500).json({
            error: 'Failed to create sales order',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = salesOrderSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed', details: validationResult.error.format() });
        return;
    }
    const { id } = req.params;
    const { qty, rate, vehicleNo } = validationResult.data;
    try {
        const salesOrder = await SalesOrder.findByPk(id);
        if (!salesOrder) {
            res.status(404).json({ error: 'Sales order not found' });
            return;
        }
        if (qty !== undefined)
            salesOrder.qty = qty;
        if (rate !== undefined)
            salesOrder.rate = rate;
        if (vehicleNo !== undefined)
            salesOrder.vehicleNo = vehicleNo;
        await salesOrder.save();
        // Fetch the updated order with its relations for the response
        const updatedOrderWithRelations = await SalesOrder.findByPk(id, {
            include: [
                { model: Customer },
                { model: Material }
            ]
        });
        res.json(updatedOrderWithRelations);
    }
    catch (error) {
        console.error('Error updating sales order:', error);
        res.status(500).json({
            error: 'Failed to update sales order',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.remove = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        const salesOrder = await SalesOrder.findByPk(id);
        if (!salesOrder) {
            res.status(404).json({ error: 'Sales order not found' });
            return;
        }
        await salesOrder.destroy();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting sales order:', error);
        res.status(500).json({
            error: 'Failed to delete sales order',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
