const mongoose = require("mongoose");
const { fallbackTransaction } = require("./fallbackDb");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  date: { type: String, required: true },
  receipt: { type: String, default: "" }
}, { timestamps: true });

const TransactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = new Proxy(TransactionModel, {
  get(target, prop) {
    if (global.useFallbackDb && prop in fallbackTransaction) {
      return fallbackTransaction[prop];
    }
    return target[prop];
  }
});
