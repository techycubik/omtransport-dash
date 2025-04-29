"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = exports.list = void 0;
const index_1 = require("../index");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const zod_1 = require("zod");
const { CrusherRun, Material } = index_1.sequelize.models;
const crusherRunSchema = zod_1.z.object({
    materialId: zod_1.z.number().int().positive('Material ID must be positive'),
    producedQty: zod_1.z.number().positive('Produced quantity must be positive'),
    dispatchedQty: zod_1.z.number().positive('Dispatched quantity must be positive'),
    runDate: zod_1.z.string().datetime('Invalid date format')
});
exports.list = (0, asyncHandler_1.default)(async (req, res) => {
    const crusherRuns = await CrusherRun.findAll({
        include: [
            { model: Material }
        ]
    });
    res.json(crusherRuns);
});
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = crusherRunSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed' });
        return;
    }
    const { materialId, producedQty, dispatchedQty, runDate } = validationResult.data;
    const crusherRun = await CrusherRun.create({
        materialId,
        producedQty,
        dispatchedQty,
        runDate: new Date(runDate)
    });
    res.status(201).json(crusherRun);
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = crusherRunSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed' });
        return;
    }
    const { id } = req.params;
    const { materialId, producedQty, dispatchedQty, runDate } = validationResult.data;
    const crusherRun = await CrusherRun.findByPk(id);
    if (!crusherRun) {
        res.status(404).json({ error: 'Crusher run not found' });
        return;
    }
    if (materialId)
        crusherRun.materialId = materialId;
    if (producedQty)
        crusherRun.producedQty = producedQty;
    if (dispatchedQty)
        crusherRun.dispatchedQty = dispatchedQty;
    if (runDate)
        crusherRun.runDate = new Date(runDate);
    await crusherRun.save();
    res.json(crusherRun);
});
