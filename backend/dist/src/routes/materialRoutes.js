"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const materialController_1 = require("../controllers/materialController");
const router = (0, express_1.Router)();
router.get('/', materialController_1.list);
router.post('/', materialController_1.create);
router.put('/:id', materialController_1.update);
exports.default = router;
