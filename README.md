# Expense Tracker – Web Application Development

**Student:** Hetvi Patel  
**Enrollment No.:** 241260131040  
**Subject:** Web Application Development (BE05000281)

## Project
A full-stack Expense Tracker built with React.js, Axios, Node.js, Express.js, MongoDB/Mongoose and JWT authentication.

## Features
- User registration and JWT login
- Protected transaction routes
- Add, edit and delete income/expense transactions
- Dashboard with income, expense and balance
- Search by title/category
- Filter by type/category
- Sorting
- Pagination
- Receipt image upload
- Loading, error and empty states
- REST API
- Responsive UI

## Project Structure
```text
expense-tracker/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   └── upload.js
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionTable.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Requirements
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- npm

## 1. Backend
```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and set:
```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/expense_tracker
JWT_SECRET=replace_with_a_long_secret
CLIENT_URL=http://localhost:5173
```

Start:
```bash
npm run dev
```
or:
```bash
npm start
```

## 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:
`http://localhost:5173`

## API Documentation

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/ping | Test server |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login and receive JWT |
| GET | /api/transactions | Get transactions |
| POST | /api/transactions | Add transaction |
| PUT | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |
| POST | /api/upload | Upload receipt |

All transaction endpoints require:
`Authorization: Bearer <JWT>`

## Demo Flow
1. Register a user.
2. Login.
3. Add income and expense records.
4. Edit/delete records.
5. Search and filter records.
6. Upload a receipt.
7. Use pagination to view records.

## Exercise 6 Report
This project is the implementation used for Experiment 10, Exercise 6 – Project Report / README.
