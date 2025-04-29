"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = exports.list = void 0;
const index_1 = require("../index");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const zod_1 = require("zod");
const { Material } = index_1.sequelize.models;
const materialSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    uom: zod_1.z.string().min(1, 'UOM is required')
});
exports.list = (0, asyncHandler_1.default)(async (req, res) => {
    const materials = await Material.findAll();
    res.json(materials);
});
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = materialSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed' });
        return;
    }
    const { name, uom } = validationResult.data;
    const material = await Material.create({ name, uom });
    res.status(201).json(material);
});
exports.update = (0, asyncHandler_1.default)(async (req, res) => {
    const validationResult = materialSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({ error: 'Validation failed' });
        return;
    }
    const { id } = req.params;
    const { name, uom } = validationResult.data;
    const material = await Material.findByPk(id);
    if (!material) {
        res.status(404).json({ error: 'Material not found' });
        return;
    }
    if (name)
        material.name = name;
    if (uom)
        material.uom = uom;
    await material.save();
    res.json(material);
});
