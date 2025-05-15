import express from "express";
import {
  signup,
  login,
  protect,
  restrict,
} from "../controllers/user.controller.js";
import {
  getUserData,
  getUserDataById,
  verifyPassword,
  updateOwnerPassword,
  updateStaffPassword,
  getSellerName,
} from "../controllers/userManagment.controller.js";

const router = express.Router();

router.get("/user/test-protect", protect, (req, res) => {
  if (req.user) {
    res.status(200).json({
      status: "success",
      message: "Authenticated as a staff",
      data: {
        id: req.user._id,
        role: req.user.role,
      },
    });
  } else {
    res.status(401).json({
      status: "fail",
      message: "Unauthorized access",
    });
  }
});
router.get("/user/test-owner", protect, restrict("owner"), (req, res) => {
  if (req.user) {
    res.status(200).json({
      status: "success",
      message: "Authenticated as a staff",
      data: {
        id: req.user._id,
        role: req.user.role,
      },
    });
  } else {
    res.status(401).json({
      status: "fail",
      message: "Unauthorized access",
    });
  }
});
router.get(
  "/user/test-staff",
  protect,
  restrict("owner", "staff"),
  (req, res) => {
    if (req.user) {
      res.status(200).json({
        status: "success",
        message: "Authenticated.",
        data: {
          id: req.user._id,
          role: req.user.role,
        },
      });
    } else {
      res.status(401).json({
        status: "fail",
        message: "Unauthorized access",
      });
    }
  }
);
router.post("/user/signup", signup);
router.post("/user/login", login);
router.get("/user/seller", protect, getSellerName);
router.post("/user", protect, restrict("owner"), verifyPassword);
router.get("/user", protect, restrict("owner"), getUserData);
router.get("/user/:id", protect, restrict("owner"), getUserDataById);
router.patch("/user/owner", protect, restrict("owner"), updateOwnerPassword);
router.patch(
  "/user/staff/:id",
  protect,
  restrict("owner"),
  updateStaffPassword
);

export default router;
