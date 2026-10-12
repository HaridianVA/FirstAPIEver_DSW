import { Router } from "express";
import { OrderController } from "./order.controller";

const router = Router();

router.get("/", OrderController.getAll);

// Las rutas específicas van ANTES de "/:id", si no Express las confundiría con un id
router.get("/customers/:id", OrderController.getByCustomerId);

router.get("/eagerly/:id", OrderController.getEagerlyById);

router.get("/:id", OrderController.getById);

router.post("/", OrderController.create);

router.put("/:id", OrderController.update);

router.delete("/:id", OrderController.delete);

export default router;