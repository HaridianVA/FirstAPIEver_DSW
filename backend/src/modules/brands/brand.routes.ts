import { Router } from "express";
import { brandController } from "./brand.controller";

const router = Router();

router.get("/", brandController.getAll);

router.get("/:id", brandController.getById);

router.post("/", brandController.create);

router.put("/:id", brandController.update);

router.delete("/:id", brandController.delete);

export default router;