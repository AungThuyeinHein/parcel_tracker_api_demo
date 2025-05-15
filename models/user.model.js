import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Please Enter User Name"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Please Enter a Password."],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please Confirm your Password."],
    validate: {
      validator: function (val) {
        return val == this.password;
      },
      message: "Password Doesn't Match.",
    },
  },
  role: {
    type: String,
    enum: ["owner", "staff"],
    default: "staff",
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.comparePasswordInDb = async (pswd, pswdDB) => {
  return await bcrypt.compare(pswd, pswdDB);
};

const User = mongoose.model("User", userSchema);

export default User;
