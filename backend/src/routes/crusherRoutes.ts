import { Router } from "express";
import {
  getCrusherMachines,
  getCrusherMachineById,
  createCrusherMachine,
  updateCrusherMachine,
  deleteCrusherMachine,
  updateCrusherMachineStatus,
} from "../controllers/crusherMachineController";
import {
  getCrusherRuns,
  getCrusherRunById,
  createCrusherRun,
  updateCrusherRun,
  deleteCrusherRun,
} from "../controllers/crusherRunController";
import {
  getDispatches,
  getDispatchById,
  createDispatch,
  updateDispatch,
  deleteDispatch,
} from "../controllers/dispatchController";
import {
  getCrusherSites,
  getCrusherSiteById,
  createCrusherSite,
  updateCrusherSite,
  deleteCrusherSite,
} from "../controllers/crusherSiteController";

const router = Router();

// Crusher Machines routes
router.get("/machines", getCrusherMachines);
router.get("/machines/:id", getCrusherMachineById);
router.post("/machines", createCrusherMachine);
router.put("/machines/:id", updateCrusherMachine);
router.patch("/machines/:id", updateCrusherMachineStatus);
router.delete("/machines/:id", deleteCrusherMachine);

// Crusher Runs routes
router.get("/runs", getCrusherRuns);
router.get("/runs/:id", getCrusherRunById);
router.post("/runs", createCrusherRun);
router.put("/runs/:id", updateCrusherRun);
router.delete("/runs/:id", deleteCrusherRun);

// Dispatch routes
router.get("/dispatches", getDispatches);
router.get("/dispatches/:id", getDispatchById);
router.post("/dispatches", createDispatch);
router.patch("/dispatches/:id", updateDispatch);
router.delete("/dispatches/:id", deleteDispatch);

// Crusher Sites routes
router.get("/sites", getCrusherSites);
router.get("/sites/:id", getCrusherSiteById);
router.post("/sites", createCrusherSite);
router.put("/sites/:id", updateCrusherSite);
router.delete("/sites/:id", deleteCrusherSite);

export default router; 