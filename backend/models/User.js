const mongoose = require("mongoose");
const { fallbackUser } = require("./fallbackDb");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema);

module.exports = new Proxy(UserModel, {
  get(target, prop) {
    if (global.useFallbackDb && prop in fallbackUser) {
      return fallbackUser[prop];
    }
    return target[prop];
  }
});
