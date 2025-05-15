import mongoose from "mongoose";

const Schema = mongoose.Schema;
const deliveryBatchSchema = new Schema({
  batchName: {
    type: String,
    required: true,
  },
  deliveryType: {
    type: String,
    enum: ["Ninja Van", "Express", "Own Delivery"],
    default: null,
  },
  parcels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parcel",
    },
  ],
  status: {
    type: String,
    enum: ["On Deliver", "Finished"],
    default: "On Deliver",
  },
  batchCreatedAt: { type: Date, default: Date.now() },
  batchUpdatedAt: { type: Date, default: null },
});

const DeliveryBatch = mongoose.model("DeliveryBatch", deliveryBatchSchema);

export default DeliveryBatch;
