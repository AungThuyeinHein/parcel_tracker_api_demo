import User from "../models/user.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";

export const getUserData = asyncErrorHandler(async (req, res, next) => {
  const userData = await User.find({}).select("-__v").lean();

  res.status(200).json({
    code: 200,
    status: "success",
    message: "User Data have been retrived successfully",
    data: { userData },
  });
});

export const getUserDataById = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new CustomError(400, "ID is required."));
  }

  const userData = await User.findById(id);

  if (!userData) {
    return next(new CustomError(400, "There is no user with the given ID."));
  }

  res.status(200).json({
    code: 200,
    status: "success",
    message: "User Data retrived successfully",
    datra: {
      userData,
    },
  });
});

export const verifyPassword = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { verifyPassword } = req.body;

  if (!verifyPassword) {
    return next(new CustomError(400, "Please provide your account password"));
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    return next(new CustomError(404, "User not found."));
  }

  // Check if the password matches
  if (user.password !== verifyPassword) {
    return next(new CustomError(401, "Password Incorrect."));
  }

  // Store the flag (you can store it in memory or session)
  req.session.passwordVerified = {
    verified: true,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
  };

  res.status(200).json({
    code: 200,
    status: "success",
    message:
      "Old password verified successfully. You can now update your password.",
  });
});

export const updateOwnerPassword = asyncErrorHandler(async (req, res, next) => {
  const { newPassword, confirmPassword } = req.body;
  const userId = req.user._id;

  const passwordVerified = req.session.passwordVerified;

  if (!passwordVerified || !passwordVerified.verified) {
    return next(new CustomError(403, "Password verification required."));
  }

  if (Date.now() > passwordVerified.expiresAt) {
    req.session.passwordVerified = null;
    return next(
      new CustomError(
        "Password verification expired. Please verify your password again."
      )
    );
  }

  if (!newPassword || !confirmPassword) {
    return next(
      new CustomError(400, "Please provide new password and confirm password")
    );
  }

  if (newPassword !== confirmPassword) {
    return next(
      new CustomError(
        400,
        "New password and confirmation password do not match"
      )
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new CustomError(404, "User not found"));
  }

  const updatedUser = await User.updateOne(
    { _id: userId },
    { $set: { password: newPassword }, $unset: { confirmPassword: "" } }
  );

  if (updatedUser.modifiedCount === 0) {
    return next(
      new CustomError(400, "Password update failed, please try again")
    );
  }

  req.session.passwordVerified = null;

  // Step 2: Send success response
  res.status(200).json({
    code: 200,
    status: "success",
    message: "Your account password updated successfully",
  });
});

export const updateStaffPassword = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return next(
      new CustomError(400, "Please provide new password and confirm password")
    );
  }

  if (newPassword !== confirmPassword) {
    return next(
      new CustomError(
        400,
        "New password and confirmation password do not match"
      )
    );
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new CustomError(404, "User not found"));
  }

  const updatedUser = await User.updateOne(
    { _id: id },
    { $set: { password: newPassword, $unset: { confirmPassword: "" } } }
  );

  if (updatedUser.modifiedCount === 0) {
    return next(
      new CustomError(400, "Password update failed, please try again")
    );
  }

  res.status(200).json({
    code: 200,
    status: "success",
    message: "Staff account Password updated successfully",
  });
});

export const getSellerName = asyncErrorHandler(async (req, res, next) => {
  const userData = await User.find({}).select("username -_id").lean();

  res.status(200).json({
    code: 200,
    status: "success",
    message: "User names have been retrived successfully",
    data: { userData },
  });
});
