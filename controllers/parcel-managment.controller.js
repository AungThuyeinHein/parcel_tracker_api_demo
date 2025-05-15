import Parcel from "../models/parcel-managment.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";
import DeliveryBatch from "../models/parcel-batching.model.js";
import mongoose from "mongoose";

export const createParcel = asyncErrorHandler(async (req, res, next) => {
  const requiredFields = ["customerName", "paymentStatus", "seller", "address"];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return next(
      new CustomError(
        400,
        `Missing required fields: ${missingFields.join(", ")}`
      )
    );
  }

  if (typeof req.body.price !== "number" || req.body.price < 0) {
    return next(new CustomError(400, "Price must be a positive number"));
  }
  if (typeof req.body.deliveryFee !== "number" || req.body.deliveryFee < 0) {
    return next(
      new CustomError(400, "Delivery fee must be a non-negative number")
    );
  }

  const parcel = new Parcel(req.body);
  await parcel.save();
  res.status(201).json({
    code: 201,
    status: "success",
    message: "Successfully added new parcel",
    data: {
      parcel,
    },
  });
});

export const getAllParcels = asyncErrorHandler(async (req, res, next) => {
  const { startDate: startDateParam, endDate: endDateParam } = req.query;
  const status = req.query.deliveryStatus;

  let query = {};

  if (status) {
    query.deliveryStatus = status;
  }

  if (startDateParam && endDateParam) {
    const startDate = new Date(
      new Date(startDateParam).setUTCHours(0, 0, 0, 0)
    );
    const endDate = new Date(
      new Date(endDateParam).setUTCHours(23, 59, 59, 999)
    );

    if (startDate > endDate) {
      return next(
        new CustomError(400, "startDate must be before or equal to endDate.")
      );
    }

    query.parcelCreatedAt = { $gte: startDate, $lte: endDate };
  }

  let parcels = await Parcel.find(query)
    .select(
      "customerName price deliveryFee parcelCreatedAt seller ParcelUpdatedAt batchId"
    )
    .sort({ customerName: 1 })
    .collation({ locale: "en" })
    .lean();

  parcels = await Parcel.populate(parcels, {
    path: "batchId",
    select: "batchCreatedAt",
  });

  const parcelsWithBatchCreatedAt = parcels.map((parcel) => ({
    ...parcel,
    batchCreatedAt: parcel.batchId ? parcel.batchId.batchCreatedAt : null,
    batchId: undefined,
  }));

  res.status(200).json({
    code: 200,
    status: "success",
    data: parcelsWithBatchCreatedAt,
  });
});

export const getParcelById = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const parcel = await Parcel.findById({ _id: id });
  if (!parcel) {
    return next(new CustomError(404, "Parcel not found."));
  }
  res.status(200).json({ code: 200, status: "success", data: parcel });
});

export const deleteParcel = asyncErrorHandler(async (req, res, next) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return next(new CustomError(400, "The 'ids' field must be an array."));
  }
  const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    return next(
      new CustomError(400, `Invalid parcel ID(s): ${invalidIds.join(", ")}`)
    );
  }
  const existingOrders = await Parcel.find({ _id: { $in: ids } });

  const nonExistentIds = ids.filter(
    (id) => !existingOrders.some((order) => order._id.toString() === id)
  );
  if (nonExistentIds.length > 0) {
    return next(
      new CustomError(
        404,
        `No parcels found with the following ID(s): ${nonExistentIds.join(
          ", "
        )}`
      )
    );
  }

  const result = await Parcel.deleteMany({ _id: { $in: ids } });
  const deletedCount = result.deletedCount;

  if (deletedCount > 0) {
    await DeliveryBatch.updateMany(
      { parcels: { $in: ids } },
      { $pull: { parcels: { $in: ids } } }
    );
  }

  res.status(200).json({
    code: 200,
    status: "success",
    message: `${deletedCount} parcel(s) successfully deleted, and their IDs removed from associated delivery batches.`,
  });
});

export const searchParcelsByCustomerName = asyncErrorHandler(
  async (req, res, next) => {
    const { query } = req.query;

    if (!query) {
      return next(new CustomError(400, "Query parameter 'query' is required"));
    }

    const parcels = await Parcel.find({
      customerName: { $regex: query, $options: "i" },
    })
      .select("customerName price parcelCreatedAt")
      .sort({ parcelCreatedAt: -1, customerName: 1 })
      .collation({ locale: "en" })
      .lean();

    res.status(200).json({
      code: 200,
      status: "success",
      message: `Search results for '${query}'`,
      data: parcels,
    });
  }
);

export const updateParcelDetails = asyncErrorHandler(async (req, res, next) => {
  const { id: parcelId } = req.params;
  const { parcelCreatedAt, batchId, seller, deliveryStatus, ...updateData } =
    req.body;

  const parcel = await Parcel.findByIdAndUpdate(
    parcelId,
    {
      $set: {
        ...updateData,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!parcel) {
    return next(new CustomError(404, `Parcel not found with ID: ${parcelId}`));
  }

  res.status(200).json({
    code: 200,
    status: "success",
    message: "Parcel details updated successfully",
    data: parcel,
  });
});

export const updateParcelDeliveryStatus = asyncErrorHandler(
  async (req, res, next) => {
    const { id: parcelId } = req.params;
    const { deliveryStatus, ParcelUpdatedAt } = req.body;

    if (!deliveryStatus) {
      return next(
        new CustomError(400, "Please provide the deliveryStatus to update.")
      );
    }

    const parcel = await Parcel.findByIdAndUpdate(
      parcelId,
      { deliveryStatus, ParcelUpdatedAt: ParcelUpdatedAt || Date.now() },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!parcel) {
      return next(
        new CustomError(404, `Parcel not found with ID: ${parcelId}`)
      );
    }

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Parcel delivery status updated successfully",
      data: parcel,
    });
  }
);
