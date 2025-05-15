import express from "express";
import {
  createParcel,
  getAllParcels,
  getParcelById,
  deleteParcel,
  searchParcelsByCustomerName,
  updateParcelDetails,
  updateParcelDeliveryStatus,
} from "../controllers/parcel-managment.controller.js";
const router = express.Router();
import { protect } from "../controllers/user.controller.js";
router.post("/parcel", protect, createParcel);
router.get("/parcels/range", protect, getAllParcels);
router.get("/parcels/search", protect, searchParcelsByCustomerName);
router.delete("/parcels", protect, deleteParcel);
router.get("/parcel/:id", protect, getParcelById);
router.patch("/parcel/status/:id", protect, updateParcelDeliveryStatus);
router.patch("/parcel/:id", protect, updateParcelDetails);

export default router;
