"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../controllers/customerController");
const router = (0, express_1.Router)();
router.get('/', customerController_1.list);
router.post('/', customerController_1.create);
router.put('/:id', customerController_1.update);
exports.default = router;
