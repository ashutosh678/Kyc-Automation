# 🔐 KYC Document Verification Platform

This project is a **KYC (Know Your Customer) document verification platform** that streamlines the onboarding process using **AI-powered document analysis** and an intelligent **checklist management system**.

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

- 📤 Upload and manage KYC documents
- 🤖 AI-powered document analysis
- 🔐 User authentication and authorization
- 📱 Responsive design across devices

---

## 🛠 Tech Stack

**Frontend:**

- React
- Tailwind CSS

**Backend:**

- Node.js
- Express
- MongoDB

**Authentication:**

- JWT (JSON Web Tokens)

**File Storage:**

- Cloudinary

---

## ✅ Prerequisites

Before running the app, make sure you have the following installed:

- Node.js (v14 or later)
- MongoDB
- A Cloudinary account for file storage

---

## 🚀 Running the Application

### Backend

Navigate to the `server` directory and start the server:

```bash
cd server
npm install
npm run dev
```

### Frontend

Navigate to the `client` directory and start the React app:

```bash
cd client
npm install
npm start
```

The application will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
kyc-document-verification/
│
├── client/                  # Frontend code
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service calls
│   │   ├── context/         # Context API for state management
│   │   └── App.jsx          # Main app component
│   └── package.json         # Frontend dependencies
│
├── server/                  # Backend code
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── app.ts           # Express app setup
│   └── package.json         # Backend dependencies
│
└── README.md                # Project documentation
```

---

### 3. Environment Variables

```bash
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements.

---

## 📜 License

This project is licensed under the MIT License.
