import mongoose from "mongoose";
const Schema = mongoose.Schema;

const parcelManagmentSchema = new Schema({
  customerName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  seller: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["COD", "Delivery Only", "Fully Paid", "Gate Drop Off"],
    required: true,
  },
  deliveryStatus: {
    type: String,
    enum: ["Success", "Cancel", "On Deli", "Pending"],
    default: "Pending",
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryBatch",
    default: null,
  },
  deliveryFee: { type: Number, required: true },
  parcelCreatedAt: { type: Date, default: Date.now() },
  ParcelUpdatedAt: { type: Date, default: null },
});

const Parcel = mongoose.model("Parcel", parcelManagmentSchema);
export default Parcel;
