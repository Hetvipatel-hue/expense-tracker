const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const DATA_DIR = path.join(__dirname, "../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], transactions: [] }, null, 2), "utf-8");
  }
}

function getDb() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    return {
      users: Array.isArray(data.users) ? data.users : [],
      transactions: Array.isArray(data.transactions) ? data.transactions : []
    };
  } catch (err) {
    console.error("Error reading fallback DB, resetting:", err);
    return { users: [], transactions: [] };
  }
}

function saveDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function matchFilter(item, filter) {
  if (!filter) return true;
  if (filter.user && String(item.user) !== String(filter.user)) return false;
  if (filter.type && filter.type !== "all" && item.type !== filter.type) return false;
  if (filter.category && filter.category !== "all" && item.category !== filter.category) return false;
  if (filter.$or && Array.isArray(filter.$or)) {
    const matched = filter.$or.some(cond => {
      for (const key of Object.keys(cond)) {
        if (cond[key] && cond[key].$regex !== undefined) {
          const regex = new RegExp(cond[key].$regex, cond[key].$options || "");
          if (regex.test(String(item[key] || ""))) return true;
        }
      }
      return false;
    });
    if (!matched) return false;
  }
  return true;
}

function sortItems(items, sortObj) {
  if (!sortObj) return items;
  const keys = Object.keys(sortObj);
  return items.slice().sort((a, b) => {
    for (const key of keys) {
      const order = sortObj[key];
      let valA = a[key];
      let valB = b[key];
      if (valA === undefined) valA = "";
      if (valB === undefined) valB = "";
      if (valA < valB) return order === -1 ? 1 : -1;
      if (valA > valB) return order === -1 ? -1 : 1;
    }
    return 0;
  });
}

class Query {
  constructor(items) {
    this._items = items;
    this._sortObj = null;
    this._skip = 0;
    this._limit = null;
  }
  sort(sortObj) {
    this._sortObj = sortObj;
    return this;
  }
  skip(skipNum) {
    this._skip = skipNum;
    return this;
  }
  limit(limitNum) {
    this._limit = limitNum;
    return this;
  }
  _exec() {
    let result = this._items;
    if (this._sortObj) {
      result = sortItems(result, this._sortObj);
    }
    if (this._skip > 0) {
      result = result.slice(this._skip);
    }
    if (this._limit !== null && this._limit !== undefined) {
      result = result.slice(0, this._limit);
    }
    return result;
  }
  then(resolve, reject) {
    try {
      resolve(this._exec());
    } catch (e) {
      reject(e);
    }
  }
}

const fallbackUser = {
  async findOne(filter) {
    const db = getDb();
    if (filter && filter.email) {
      return db.users.find(u => u.email.toLowerCase() === filter.email.toLowerCase()) || null;
    }
    if (filter && filter._id) {
      return db.users.find(u => String(u._id) === String(filter._id)) || null;
    }
    return null;
  },
  async create(userData) {
    const db = getDb();
    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: (userData.name || "").trim(),
      email: (userData.email || "").toLowerCase().trim(),
      password: userData.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  }
};

const fallbackTransaction = {
  async countDocuments(filter) {
    const db = getDb();
    return db.transactions.filter(item => matchFilter(item, filter)).length;
  },
  find(filter) {
    const db = getDb();
    const matched = db.transactions.filter(item => matchFilter(item, filter));
    return new Query(matched);
  },
  async create(data) {
    const db = getDb();
    const item = {
      _id: new mongoose.Types.ObjectId().toString(),
      user: String(data.user),
      title: (data.title || "").trim(),
      amount: Number(data.amount),
      category: (data.category || "").trim(),
      type: data.type,
      date: data.date,
      receipt: data.receipt || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.transactions.push(item);
    saveDb(db);
    return item;
  },
  async findOneAndUpdate(filter, update, options) {
    const db = getDb();
    const index = db.transactions.findIndex(t => 
      String(t._id) === String(filter._id) && String(t.user) === String(filter.user)
    );
    if (index === -1) return null;
    const existing = db.transactions[index];
    const updated = {
      ...existing,
      ...update,
      _id: existing._id,
      user: existing.user,
      updatedAt: new Date().toISOString()
    };
    db.transactions[index] = updated;
    saveDb(db);
    return updated;
  },
  async findOneAndDelete(filter) {
    const db = getDb();
    const index = db.transactions.findIndex(t => 
      String(t._id) === String(filter._id) && String(t.user) === String(filter.user)
    );
    if (index === -1) return null;
    const deleted = db.transactions.splice(index, 1)[0];
    saveDb(db);
    return deleted;
  }
};

module.exports = {
  fallbackUser,
  fallbackTransaction
};
