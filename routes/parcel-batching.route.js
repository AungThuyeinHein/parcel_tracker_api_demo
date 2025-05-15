import express from "express";

const router = express.Router();
import {
  createDeliveryBatchFromParcels,
  getDeliveryBatchesByStatus,
  getDeliveryBatchById,
  // updateParcelStatusesInBatch,
  deleteDeliveryBatch,
} from "../controllers/parcel-batching.controller.js";
import { protect } from "../controllers/user.controller.js";

router.post("/parcel-batch", protect, createDeliveryBatchFromParcels);
router.get("/parcel-batch", protect, getDeliveryBatchesByStatus);
router.get("/parcel-batch/:batchId", protect, getDeliveryBatchById);
// router.patch("/parcel-batch/:batchId", protect, updateParcelStatusesInBatch);
router.delete("/parcel-batch/:id", protect, deleteDeliveryBatch);
export default router;
