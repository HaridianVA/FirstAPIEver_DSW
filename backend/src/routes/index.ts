import { Router } from "express";
import bicycleRoutes from "../modules/bicycles/bicycle.routes";
import brandRoutes from "../modules/brands/brand.routes";
import bicycleDetailsRoutes from "../modules/bicycleDetails/bicycleDetails.routes";


const router = Router();

router.use("/bicycles", bicycleRoutes);

router.use("/brands", brandRoutes);

router.use("/bicycleDetails", bicycleDetailsRoutes);

export default router;