import express from "express";
import { getSalesReport } from "../controllers/parcel-saleReport.controller.js";
import { getAllFinishedBatchesWithCounts } from "../controllers/parcel-saleReport.controller.js";
import { protect } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/sales-report", protect, getSalesReport);
router.get("/delivery-report", protect, getAllFinishedBatchesWithCounts);

export default router;
