import User from "../models/user.model.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customError.js";
import jwt from "jsonwebtoken";
import util from "util";

export const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

export const signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);
  const { password: pass, __v, ...rest } = newUser._doc;

  res.status(201).json({
    statusCode: 201,
    status: "success",
    message: "User created successfully.",
    data: { token },
  });
});

export const login = asyncErrorHandler(async (req, res, next) => {
  const { username, password } = req.body;

  //Check id email & password is present in request body
  if (!username || !password) {
    return next(
      new CustomError(
        400,
        "Please provide correct Username & Password for login!"
      )
    );
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    const error = new CustomError(400, "Incorrect email or password");
    return next(error);
  }

  const token = signToken(user._id);
  const {
    password: pass,
    __v,
    passwordResetToken,
    passwordResetTokenExpire,
    ...rest
  } = user._doc;

  res.status(200).json({
    code: 200,
    status: "success",
    message: "User successfully log in.",
    data: {
      user: rest,
      token,
    },
  });
});

export const protect = asyncErrorHandler(async (req, res, next) => {
  const Token = req.headers.authorization;
  let token;
  if (Token && Token.startsWith("Bearer")) {
    token = Token.split(" ")[1];
  }
  if (!token) {
    next(
      new CustomError(401, "You are not logged in! Authentication required")
    );
  }

  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );

  const user = await User.findById(decodedToken.id);

  if (!user) {
    const error = new CustomError(401, "The User does not exist");
    next(error);
  }

  req.user = user;
  next();
});

export const restrict = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(
        new CustomError(401, "Unauthorized. No role information available.")
      );
    }
    if (!allowedRoles.includes(userRole)) {
      return next(
        new CustomError(
          403,
          `Access denied. Role '${userRole}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};
