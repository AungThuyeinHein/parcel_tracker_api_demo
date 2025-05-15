import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
// import expressMongoSanitize from "express-mongo-sanitize";
import session from "express-session";

// User Define Module
import CustomError from "./utils/customError.js";
import globalErrorHandler from "./controllers/error.controller.js";
import setupSwagger from "./configs/swagger.config.js";
import parcelManagmentRouter from "./routes/parcel-managment.route.js";
import userRouter from "./routes/user.route.js";
import parcelBatchingRouter from "./routes/parcel-batching.route.js";
import saleReportRouter from "./routes/parcel-saleReport.route.js";

const app = express();
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

let limiter = rateLimit({
  max: 60,
  windowMs: 60 * 1000,
  handler: (req, res) => {
    res.status(429).json({
      code: 429,
      status: "fail",
      message: "Too many requests. Please try again later",
    });
  },
});

app.use("/api", limiter);

app.use(
  cors({
    origin: "*",
    // origin: [
    //   "",
    //   "",
    // ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10kb" }));
// app.use(expressMongoSanitize());

//Route Mounting
app.use("/api/v1", userRouter);
app.use("/api/v1", parcelManagmentRouter);
app.use("/api/v1", parcelBatchingRouter);
app.use("/api/v1", saleReportRouter);

setupSwagger(app);

app.all("/*any", (req, res, next) => {
  const err = new CustomError(
    404,
    `Can't find ${req.originalUrl} on the server!`
  );
  next(err);
});

app.use(globalErrorHandler);

export default app;
