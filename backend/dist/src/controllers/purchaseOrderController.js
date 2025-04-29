"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroy = exports.update = exports.create = exports.list = void 0;
const index_1 = require("../index");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const zod_1 = require("zod");
const { PurchaseOrder, Vendor, Material } = index_1.sequelize.models;
const purchaseOrderSchema = zod_1.z.object({
    vendorId: zod_1.z.number().int().positive('Vendor ID must be positive'),
    materialId: zod_1.z.number().int().positive('Material ID must be positive'),
    qty: zod_1.z.number().positive('Quantity must be positive'),
    rate: zod_1.z.number().positive('Rate must be positive'),
    orderDate: zod_1.z.string().datetime('Invalid date format'),
    status: zod_1.z.enum(['PENDING', 'RECEIVED', 'PARTIAL']).optional()
});
exports.list = (0, asyncHandler_1.default)(async (req, res) => {
    const purchaseOrders = await PurchaseOrder.findAll({
        include: [
            { model: Vendor },
            { model: Material }
        ]
    });
    res.json(purchaseOrders);
});
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = purchaseOrderSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed' });
        return;
    }
    const { vendorId, materialId, qty, rate, orderDate, status } = validationResult.data;
    const purchaseOrder = await PurchaseOrder.create({
        vendorId,
        materialId,
        qty,
        rate,
        orderDate,
        status: status || 'PENDING'
    });
    res.status(201).json(purchaseOrder);
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = purchaseOrderSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed' });
        return;
    }
    const { id } = req.params;
    const { qty, rate, status } = validationResult.data;
    const purchaseOrder = await PurchaseOrder.findByPk(id);
    if (!purchaseOrder) {
        res.status(404).json({ error: 'Purchase order not found' });
        return;
    }
    if (qty)
        purchaseOrder.qty = qty;
    if (rate)
        purchaseOrder.rate = rate;
    if (status)
        purchaseOrder.status = status;
    await purchaseOrder.save();
    res.json(purchaseOrder);
});
exports.destroy = (0, asyncHandler_1.default)(async (req, res) => {
    const { id } = req.params;
    const purchaseOrder = await PurchaseOrder.findByPk(id);
    if (!purchaseOrder) {
        res.status(404).json({ error: 'Purchase order not found' });
        return;
    }
    await purchaseOrder.destroy();
    res.status(204).send();
});
