import DeliveryBatch from "../models/parcel-batching.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";

export const createDeliveryBatchFromParcels = asyncErrorHandler(
  async (req, res, next) => {
    const { parcelIds, deliveryType, batchCreatedAt } = req.body;

    if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
      return next(
        new CustomError(
          400,
          "Please provide an array of parcel IDs to create a batch."
        )
      );
    }

    if (
      deliveryType &&
      !["Ninja Van", "Express", "Own Delivery"].includes(deliveryType)
    ) {
      return next(
        new CustomError(400, "Invalid deliveryType.", {
          allowedValues: ["Ninja Van", "Express", "Own Delivery"],
        })
      );
    }

    let clientSideTimestamp = null;
    if (batchCreatedAt) {
      clientSideTimestamp = new Date(batchCreatedAt);
    } else {
      clientSideTimestamp = new Date();
    }

    const hours = clientSideTimestamp.getHours();
    const minutes = clientSideTimestamp.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const timestamp = `${formattedHours}:${formattedMinutes} ${ampm}`;

    const batchName = deliveryType
      ? `${deliveryType} ${timestamp}`
      : `Batch ${timestamp}`;

    const deliveryBatch = new DeliveryBatch({
      batchName: batchName,
      deliveryType: deliveryType || null,
      parcels: parcelIds,
      batchCreatedAt: batchCreatedAt || Date.now(),
    });
    const savedBatch = await deliveryBatch.save();
    const batchId = savedBatch._id;

    const updateParcelsResult = await Parcel.updateMany(
      { _id: { $in: parcelIds }, deliveryStatus: "Pending" },
      {
        $set: {
          deliveryStatus: "On Deli",
          batchId: batchId,
        },
      }
    );

    if (updateParcelsResult.modifiedCount !== parcelIds.length) {
      console.warn(
        `Warning: Expected to update ${parcelIds.length} parcels, but only updated ${updateParcelsResult.modifiedCount}. Some parcels might not have been in 'Pending' status or IDs were invalid.`
      );
    }

    await savedBatch.populate("parcels");

    res.status(201).json({
      code: 201,
      status: "success",
      message: "Delivery batch created and parcels updated successfully",
      data: savedBatch,
      updatedParcelCount: updateParcelsResult.modifiedCount,
    });
  }
);

export const getDeliveryBatchById = asyncErrorHandler(
  async (req, res, next) => {
    const batchId = req.params.batchId;
    const deliveryBatch = await DeliveryBatch.findById(batchId).populate(
      "parcels"
    );

    if (!deliveryBatch) {
      return next(
        new CustomError(404, `Delivery batch not found with ID: ${batchId}`)
      );
    }

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Delivery batch retrieved successfully",
      data: deliveryBatch,
      total_parcel: deliveryBatch.parcels.length,
    });
  }
);

export const getDeliveryBatchesByStatus = asyncErrorHandler(
  async (req, res, next) => {
    const statusFilter = req.query.status;

    const allowedStatuses = ["On Deliver", "Finished"];

    if (statusFilter && !allowedStatuses.includes(statusFilter)) {
      return next(
        new CustomError(400, "Invalid batch status filter.", {
          allowedValues: allowedStatuses,
        })
      );
    }

    let query = {};

    if (statusFilter) {
      query = { batchStatus: statusFilter };
    }

    const deliveryBatches = await DeliveryBatch.find(
      statusFilter ? { status: statusFilter } : {}
    )
      .select("-__v -batchUpdatedAt")
      .sort({ batchCreatedAt: -1, batchUpdatedAt: -1 });

    if (!deliveryBatches || deliveryBatches.length === 0) {
      let message = "No delivery batches found";
      if (statusFilter) {
        message = `No delivery batches found with status: ${statusFilter}`;
      }
      return res.status(200).json({
        code: 200,
        status: "success",
        message: message,
        data: [],
      });
    }

    const batchesWithParcelCount = deliveryBatches.map((batch) => {
      return {
        ...batch.toObject(),
        parcelCount: batch.parcels.length,
      };
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: statusFilter
        ? `Delivery batches with status '${statusFilter}' retrieved successfully`
        : "All delivery batches retrieved successfully",
      data: batchesWithParcelCount,
    });
  }
);

// export const updateParcelStatusesInBatch = asyncErrorHandler(
//   async (req, res, next) => {
//     const batchId = req.params.batchId;
//     const { successParcelIds, timestamps: frontendTimestamps } = req.body;

//     if (!batchId) {
//       return next(
//         new CustomError(400, "Batch ID is required in the URL path.")
//       );
//     }

//     if (!Array.isArray(successParcelIds)) {
//       return next(
//         new CustomError(
//           400,
//           "Request body must contain an array called 'successParcelIds'."
//         )
//       );
//     }

//     const updateTimestamp = frontendTimestamps
//       ? new Date(frontendTimestamps)
//       : Date.now();

//     if (frontendTimestamps && isNaN(updateTimestamp.getTime())) {
//       return next(
//         new CustomError(
//           400,
//           "Invalid 'timestamps' value. Please provide a valid date/time string."
//         )
//       );
//     }

//     const successBulkOps = successParcelIds.map((parcelId) => ({
//       updateOne: {
//         filter: { _id: parcelId, batchId: batchId, deliveryStatus: "On Deli" },
//         update: {
//           $set: { deliveryStatus: "Success", ParcelUpdatedAt: updateTimestamp },
//         },
//       },
//     }));

//     const onDeliParcelsToCancel = await Parcel.find({
//       batchId: batchId,
//       deliveryStatus: "On Deli",
//       _id: { $nin: successParcelIds },
//     });

//     const cancelBulkOps = onDeliParcelsToCancel.map((parcel) => ({
//       updateOne: {
//         filter: { _id: parcel._id, deliveryStatus: "On Deli" },
//         update: {
//           $set: { deliveryStatus: "Cancel", ParcelUpdatedAt: updateTimestamp },
//         },
//       },
//     }));

//     const bulkWriteResult = await Parcel.bulkWrite([
//       ...successBulkOps,
//       ...cancelBulkOps,
//     ]);

//     const updatedSuccessCount = successBulkOps.length;
//     const updatedCancelCount = cancelBulkOps.length;

//     const batchParcels = await Parcel.find({ batchId: batchId });
//     const allParcelsFinished = batchParcels.every((parcel) =>
//       ["Success", "Cancel"].includes(parcel.deliveryStatus)
//     );

//     let batchStatusUpdatedToFinished = false;
//     if (allParcelsFinished) {
//       await DeliveryBatch.findByIdAndUpdate(batchId, {
//         $set: { status: "Finished", batchUpdatedAt: updateTimestamp },
//       });
//       batchStatusUpdatedToFinished = true;
//     }

//     const updatedBatch = await DeliveryBatch.findById(batchId).populate(
//       "parcels"
//     );

//     res.status(200).json({
//       code: 200,
//       status: "success",
//       message: "Parcel statuses updated in batch successfully.",
//       data: updatedBatch,
//       successParcelCount: updatedSuccessCount,
//       cancelParcelCount: updatedCancelCount,
//       batchStatusUpdatedToFinished: batchStatusUpdatedToFinished,
//     });
//   }
// );

export const deleteDeliveryBatch = asyncErrorHandler(async (req, res, next) => {
  const { id: batchId } = req.params;

  const deliveryBatch = await DeliveryBatch.findById(batchId);

  if (!deliveryBatch) {
    return next(
      new CustomError(404, `Delivery batch not found with ID: ${batchId}`)
    );
  }

  const parcelIds = deliveryBatch.parcels;

  await Parcel.updateMany(
    { _id: { $in: parcelIds } },
    { deliveryStatus: "Pending", batchId: null }
  );

  await DeliveryBatch.findByIdAndDelete(batchId);

  res.status(200).json({
    code: 200,
    status: "success",
    message:
      "Delivery batch deleted successfully, and associated parcels reverted to pending.",
  });
});
