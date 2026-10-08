import { Router } from "express";
import bicycleRoutes from "../modules/bicycles/bicycle.routes";
import brandRoutes from "../modules/brands/brand.routes";
import bicycleDetailsRoutes from "../modules/bicycleDetails/bicycleDetails.routes";
import customerRoutes from "../modules/customers/customer.routes";


const router = Router();

router.use("/bicycles", bicycleRoutes);

router.use("/brands", brandRoutes);

router.use("/bicycleDetails", bicycleDetailsRoutes);

router.use("/customers", customerRoutes);

export default router;