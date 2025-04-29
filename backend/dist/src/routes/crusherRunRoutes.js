"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crusherRunController_1 = require("../controllers/crusherRunController");
const router = (0, express_1.Router)();
router.get('/', crusherRunController_1.list);
router.post('/', crusherRunController_1.create);
router.put('/:id', crusherRunController_1.update);
exports.default = router;
