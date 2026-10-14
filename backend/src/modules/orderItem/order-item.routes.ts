import { Router } from "express";
import { OrderItemController } from "./order-item.controller";

const router = Router();

router.get("/", OrderItemController.getAll);

// Las rutas específicas van ANTES de "/:id"
router.get("/orders/:id/bicycles", OrderItemController.getOrderWithBicycles);

router.get("/orders/:id", OrderItemController.getByOrderId);

router.get("/:id", OrderItemController.getById);

router.post("/", OrderItemController.create);

router.put("/:id", OrderItemController.update);

router.delete("/:id", OrderItemController.delete);

export default router;
