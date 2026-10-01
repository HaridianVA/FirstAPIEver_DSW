import { Router } from "express";
import { bicycleDetailsController} from "./bicycleDetails.controller";

const router = Router();

router.get("/", bicycleDetailsController.getAll);

router.get("/:id", bicycleDetailsController.getById);

router.post("/", bicycleDetailsController.create);

router.put("/:id", bicycleDetailsController.update);

router.delete("/:id", bicycleDetailsController.delete);

router.get("/eagerly/:id", bicycleDetailsController.getEagerlyById);
export default router;