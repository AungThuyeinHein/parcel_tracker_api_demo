import Parcel from "../models/parcel-managment.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import DeliveryBatch from "../models/parcel-batching.model.js";
import CustomError from "../utils/customError.js";

export const getSalesReport = asyncErrorHandler(async (req, res, next) => {
  const { startDate: startDateParam, endDate: endDateParam } = req.query;

  if (!startDateParam || !endDateParam) {
    return next(new CustomError(400, "Start date and end date are required"));
  }

  const startDateUTC = new Date(startDateParam);
  const endDateUTC = new Date(endDateParam);

  const myanmarOffset = 6 * 60 * 60 * 1000 + 30 * 60 * 1000;

  const startDateMyanmar = new Date(startDateUTC.getTime() + myanmarOffset);
  startDateMyanmar.setHours(0, 0, 0, 0);
  const startDateUTCAdjusted = new Date(
    startDateMyanmar.getTime() - myanmarOffset
  );

  const endDateMyanmar = new Date(endDateUTC.getTime() + myanmarOffset);
  endDateMyanmar.setHours(23, 59, 59, 999);
  const endDateUTCAdjusted = new Date(endDateMyanmar.getTime() - myanmarOffset);

  if (startDateUTCAdjusted > endDateUTCAdjusted) {
    return next(
      new CustomError(400, "startDate must be before or equal to endDate.")
    );
  }

  const salesReportPipeline = [
    {
      $match: {
        deliveryStatus: "Success",
        ParcelUpdatedAt: {
          $gte: startDateUTCAdjusted,
          $lt: endDateUTCAdjusted,
        },
      },
    },
    {
      $group: {
        _id: "$seller",
        sellerName: { $first: "$seller" },
        sellerTotalSaleAmount: {
          $sum: { $subtract: ["$price", "$deliveryFee"] },
        },
        successParcelCount: { $sum: 1 },
      },
    },
    {
      $sort: { sellerTotalSaleAmount: -1 },
    },
    {
      $project: {
        _id: 0,
        sellerName: "$sellerName",
        sellerTotalSaleAmount: 1,
        successParcelCount: 1,
      },
    },
  ];

  const sellerSalesData = await Parcel.aggregate(salesReportPipeline).exec();
  let totalSalesValue = 0;
  let topSeller = null;

  if (sellerSalesData && sellerSalesData.length > 0) {
    totalSalesValue = sellerSalesData.reduce(
      (sum, sellerData) => sum + sellerData.sellerTotalSaleAmount,
      0
    );
    topSeller = sellerSalesData[0];
  }

  const dateRangeQuery = {
    ParcelUpdatedAt: { $gte: startDateUTCAdjusted, $lte: endDateUTCAdjusted },
  };

  const totalParcelCount = await Parcel.countDocuments(dateRangeQuery);

  const successCount = await Parcel.countDocuments({
    ...dateRangeQuery,
    deliveryStatus: "Success",
  });
  const cancelCount = await Parcel.countDocuments({
    ...dateRangeQuery,
    deliveryStatus: "Cancel",
  });

  const formattedStartDate = new Date(
    startDateUTCAdjusted.getTime() + myanmarOffset
  ).toLocaleDateString();
  const formattedEndDate = new Date(
    endDateUTCAdjusted.getTime() + myanmarOffset
  ).toLocaleDateString();

  res.status(200).json({
    code: 200,
    status: "success",
    message: `Sales report generated successfully for the period from ${formattedStartDate} to ${formattedEndDate} (Myanmar Time).`,
    data: {
      totalSalesValue: totalSalesValue,
      totalParcelCount: totalParcelCount,
      sellerSalesData: sellerSalesData,
      topSeller: topSeller || null,
      successCount: successCount,
      cancelCount: cancelCount,
    },
  });
});

export const getAllFinishedBatchesWithCounts = asyncErrorHandler(
  async (req, res, next) => {
    const { startDate: startDateParam, endDate: endDateParam } = req.query;

    if (!startDateParam || !endDateParam) {
      return next(new CustomError(400, "Start date and end date are required"));
    }

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

    const finishedBatches = await DeliveryBatch.find({
      status: { $in: ["Finished", "On Deliver"] },
      batchCreatedAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const batchesWithCounts = await Promise.all(
      finishedBatches.map(async (batch) => {
        const parcelCounts = await Parcel.aggregate([
          {
            $match: {
              batchId: batch._id,
              deliveryStatus: { $in: ["Success", "Cancel"] },
            },
          },
          {
            $group: {
              _id: "$deliveryStatus",
              count: { $sum: 1 },
            },
          },
        ]);

        let successCount = 0;
        let cancelCount = 0;

        parcelCounts.forEach((item) => {
          if (item._id === "Success") {
            successCount = item.count;
          } else if (item._id === "Cancel") {
            cancelCount = item.count;
          }
        });

        return {
          ...batch.toObject(),
          successParcelCount: successCount,
          cancelParcelCount: cancelCount,
        };
      })
    );

    const formattedStartDate = startDate.toLocaleDateString();
    const formattedEndDate = endDate.toLocaleDateString();

    res.status(200).json({
      code: 200,
      status: "success",
      message: `Successfully retrieved finished and on-deliver delivery batches for the period from ${formattedStartDate} to ${formattedEndDate} with parcel counts.`,
      data: batchesWithCounts,
    });
  }
);
