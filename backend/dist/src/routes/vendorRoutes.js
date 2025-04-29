"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendorController_1 = require("../controllers/vendorController");
const router = (0, express_1.Router)();
router.get('/', vendorController_1.list);
router.post('/', vendorController_1.create);
router.put('/:id', vendorController_1.update);
exports.default = router;
