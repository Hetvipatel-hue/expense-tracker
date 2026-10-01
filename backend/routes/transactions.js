const router = require("express").Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      type = "all",
      category = "all",
      sort = "date-desc",
      page = 1,
      limit = 5
    } = req.query;

    const filter = {
      user: req.user.id,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ]
    };

    if (type !== "all") filter.type = type;
    if (category !== "all") filter.category = category;

    const sortMap = {
      "date-desc": { date: -1, createdAt: -1 },
      "date-asc": { date: 1, createdAt: 1 },
      "amount-high": { amount: -1 },
      "amount-low": { amount: 1 },
      "title-az": { title: 1 },
      "title-za": { title: -1 }
    };

    const pageNum = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 50);
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort(sortMap[sort] || sortMap["date-desc"])
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);

    res.json({
      transactions,
      page: pageNum,
      pages: Math.max(Math.ceil(total / pageSize), 1),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const rows = await Transaction.find({ user: req.user.id });
    const income = rows.filter(x => x.type === "income").reduce((s, x) => s + x.amount, 0);
    const expense = rows.filter(x => x.type === "expense").reduce((s, x) => s + x.amount, 0);
    res.json({ income, expense, balance: income - expense, count: rows.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, amount, category, type, date, receipt = "" } = req.body;
    if (!title || amount === undefined || !category || !type || !date) {
      return res.status(400).json({ message: "All transaction fields are required" });
    }
    const transaction = await Transaction.create({
      user: req.user.id, title, amount, category, type, date, receipt
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Transaction not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!deleted) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
