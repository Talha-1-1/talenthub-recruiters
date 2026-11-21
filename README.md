## 📝 What Has Been Done So Far (Task 1 Progress Summary)

### 1. Project Initialization & Architecture Setup
* Initialized the Node.js / Express backend with modular MVC architecture (Controllers, Middleware, Models, Routes, Utils, Config).
* Established standard root-level configuration files: `package.json`, `.gitignore`, `.env.example`, and local `.env`.
* Configured automated run scripts:
  * `npm start`: Standard production startup.
  * `npm run dev`: Hot-reloading development server via Nodemon.
  * `npm test`: Automated Supertest end-to-end integration test suite.

### 2. MongoDB & User Data Modeling
* Established connection handlers with Mongoose connecting to local MongoDB daemon or MongoDB Atlas cloud cluster.
* Designed the `User` schema tailored specifically for recruitment agency workflows:
  * Multi-role support (`candidate`, `agent`, `admin`) to allow seamless conversation routing in subsequent tasks.
  * Robust email format validation and uniqueness constraints.
  * Clean password redaction via schema-level `.toJSON()` transformation to ensure sensitive hashes never leak into API responses.

### 3. Password Security & bcryptjs Integration
* Implemented automatic password hashing using `bcryptjs` with 10 salt rounds executed inside a Mongoose `pre('save')` lifecycle hook.
* Added custom instance method `user.matchPassword(enteredPassword)` using bcrypt comparison for login verification.

### 4. JWT Authentication & Protected Route Middleware
* Developed a stateless token generator utility (`generateToken.js`) signing HMAC SHA-256 tokens containing user `id` and `role` with a 7-day expiration (`JWT_EXPIRE=7d`).
* Built the `protect` authentication middleware (`authMiddleware.js`):
  * Extracts tokens from the `Authorization: Bearer <token>` header.
  * Verifies signature and expiration using `jsonwebtoken`.
  * Fetches and attaches the active user record (excluding password) to `req.user`.
  * Emits descriptive error messages (`401 Unauthorized`) for missing, invalid, or expired tokens.

### 5. API Endpoints Implemented
* **`GET /api/health`**: Public service health check verifying server uptime and status.
* **`POST /api/auth/register`**: Validates input, prevents duplicate registrations, hashes password, saves to MongoDB, and returns **`201 Created`** with a signed JWT.
* **`POST /api/auth/login`**: Validates credentials against hashed passwords and returns **`200 OK`** with a signed JWT.
* **`GET /api/profile`**: JWT-protected route returning the logged-in user's profile and name (meets strict mentor requirement).
* **`GET /api/auth/profile`**: Dual-path compatibility route for flexible client integration.

### 6. Testing & Quality Assurance
* Built an automated test suite (`test-auth.js`) with Supertest testing 8 end-to-end scenarios (registration, duplicate checks, login, invalid login rejection, protected profile access, and tokenless 401 rejections).
* Packaged a ready-to-import Postman collection (`TalentHub_Chat_Task1.postman_collection.json`) configured with collection variables and automated token-saving scripts.

---

## 🚀 Mentor Review Checklist (Task 1 Deliverables)

| Requirement | Status | Evidence / Implementation |
| :--- | :---: | :--- |
| **Repository contains `.env.example`, `README.md`, `package.json`** | ✅ PASS | All configuration files located in root directory |
| **`POST /api/auth/register` stores a hashed password & returns 201** | ✅ PASS | Hashes with `bcryptjs` (salt factor 10), creates user in MongoDB, returns `201 Created` with signed JWT |
| **`POST /api/auth/login` returns a valid JWT** | ✅ PASS | Compares passwords with `matchPassword()`, issues signed JWT containing user ID and role |
| **Protected `GET /api/profile` works only with valid token** | ✅ PASS | Protected by `protect` middleware; returns 200 with user name and data; blocks unauthorized requests with 401 |
| **Automated Testing Suite Included** | ✅ PASS | 8 automated tests via Supertest & Postman Collection v2.1 |

---

## 📂 Project Architecture & Directory Structure

```text
TalentHub Recruiters/
├── .env.example                               # Template for environment configuration
├── .gitignore                                 # Git ignore rules for node_modules, .env, logs
├── package.json                               # Dependencies and npm execution scripts
├── README.md                                  # Comprehensive documentation
├── TalentHub_Chat_Task1.postman_collection.json # Postman collection for mentor evaluation
├── test-auth.js                               # Automated Supertest integration test suite
├── test-endpoints.js                          # HTTP test runner for standalone live server
└── src/
    ├── server.js                              # Express app configuration & server entry point
    ├── config/
    │   └── db.js                              # Mongoose connection logic to MongoDB
    ├── controllers/
    │   └── authController.js                  # Register, login, and profile handlers
    ├── middleware/
    │   └── authMiddleware.js                  # JWT extraction & verification middleware
    ├── models/
    │   └── User.js                            # Mongoose User schema with pre-save hashing
    ├── routes/
    │   └── authRoutes.js                      # Express router for authentication endpoints
    └── utils/
        └── generateToken.js                   # JWT signing helper utility
```

---

## 🛠️ Tech Stack & Key Libraries

- **Node.js** (v26+ compatible, LTS recommended)
- **Express.js** (`^5.3.0`): Robust HTTP API framework
- **MongoDB & Mongoose** (`^9.12.3`): Document database and object modeling
- **jsonwebtoken** (`^9.0.3`): Stateless authentication using HMAC SHA256 signed tokens
- **bcryptjs** (`^3.0.3`): One-way salted password hashing (10 salt rounds)
- **dotenv** (`^18.0.10`): Environment variable management
- **cors** (`^2.8.6`): Cross-Origin Resource Sharing middleware
- **supertest** (`^7.0.0`): Automated integration testing library

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory modeled after `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas or Local)
# Atlas URI: mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database_name>?retryWrites=true&w=majority
# Local URI: mongodb://127.0.0.1:27017/<database_name>
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

---

## 📥 Installation & Running Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Talha-1-1/talenthub-recruiters.git
cd "TalentHub Recruiters"
npm install
```

### 2. Configure MongoDB
Ensure a local MongoDB daemon is running or paste your free MongoDB Atlas connection string into `.env`:
```bash
# If using local MongoDB
mongod --dbpath <path-to-db-dir>
```

### 3. Start the Server
```bash
# Production start
npm start

# Development mode with Nodemon auto-reload
npm run dev
```

The server will initialize on `http://localhost:5000`.

---

## 🧪 Running Automated Tests

Run the automated test suite verifying all 8 authentication test cases:
```bash
npm test
```

### Test Coverage Summary:
1. `GET /api/health` — Verifies system health check (200 OK).
2. `POST /api/auth/register` — Registers candidate, hashes password with bcrypt, returns 201 Created + signed JWT.
3. `POST /api/auth/register` (Duplicate) — Prevents duplicate emails, returns 400 Bad Request.
4. `POST /api/auth/login` — Authenticates user, validates bcrypt hash, returns 200 OK + JWT.
5. `POST /api/auth/login` (Invalid password) — Rejects bad credentials with 401 Unauthorized.
6. `GET /api/profile` (Protected) — Validates Bearer token, returns 200 OK + profile without exposing password.
7. `GET /api/auth/profile` (Protected) — Dual path compatibility check (200 OK).
8. `GET /api/profile` (Without Token) — Rejects unauthorized access with 401 Unauthorized.

---

## 📡 API Specification & Documentation

### 1. Register User
- **Method / Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Muhammad Talha Ayub",
  "email": "talha@example.com",
  "password": "Password123!",
  "role": "candidate",
  "title": "Full Stack MERN Developer"
}
```
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67b931e28...",
    "name": "Muhammad Talha Ayub",
    "email": "talha@example.com",
    "role": "candidate",
    "title": "Full Stack MERN Developer",
    "createdAt": "2026-11-21T05:45:00.000Z"
  }
}
```

---

### 2. Login User
- **Method / Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "email": "talha@example.com",
  "password": "Password123!"
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67b931e28...",
    "name": "Muhammad Talha Ayub",
    "email": "talha@example.com",
    "role": "candidate",
    "title": "Full Stack MERN Developer",
    "createdAt": "2026-11-21T05:45:00.000Z"
  }
}
```

---

### 3. Get User Profile (Protected)
- **Method / Endpoint:** `GET /api/profile` (also accessible at `GET /api/auth/profile`)
- **Access:** Private (Requires JWT Bearer Token)
- **Request Headers:**
  - `Authorization: Bearer <your_jwt_token>`
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "user": {
    "_id": "67b931e28...",
    "name": "Muhammad Talha Ayub",
    "email": "talha@example.com",
    "role": "candidate",
    "title": "Full Stack MERN Developer",
    "createdAt": "2026-11-21T05:45:00.000Z",
    "updatedAt": "2026-11-21T05:45:00.000Z"
  }
}
```
- **Unauthorized Response (`401 Unauthorized`):**
```json
{
  "success": false,
  "message": "Not authorized: No Bearer token provided in Authorization header"
}
```

---

## 📮 Postman Collection

Import `TalentHub_Chat_Task1.postman_collection.json` into Postman:
1. Open Postman -> Click **Import** -> Select `TalentHub_Chat_Task1.postman_collection.json`.
2. The collection includes pre-configured requests and automated test scripts that automatically capture and save the `authToken` into collection variables upon running Register or Login.
3. Run the requests sequentially:
   - `Health Check`
   - `1. Register Candidate` (auto-saves token)
   - `2. Register Agent`
   - `3. Login User` (auto-saves token)
   - `4. Get Profile (Protected /api/profile)`
   - `5. Get Profile (/api/auth/profile)`
   - `6. Access Protected Profile Without Token (401 verification)`

---

## 🔒 Security & Data Modeling Details

1. **Password Hashing:** Passwords are never saved in plain text. A Mongoose `pre('save')` middleware hashes passwords with `bcryptjs` using a salt work factor of 10.
2. **Password Redaction:** The User schema overrides `.toJSON()` to automatically strip `password` and `__v` from all JSON responses, preventing accidental credential exposure.
3. **Stateless JWT Tokens:** JSON Web Tokens are signed using HMAC SHA256 with an expiration of 7 days (`JWT_EXPIRE`). Payload contains `id` and `role`.
4. **Role Support:** Users can register as `candidate` or `agent`, preparing the foundation for Task 2 real-time chat routing between candidates and recruiters.

---

## 🎯 Next Steps: Task 2 Preview
* Initialize frontend React client.
* Integrate Socket.io on server and client for real-time bi-directional messaging.
* Build responsive chat UI tailored for TalentHub recruitment conversations.
* Implement room-based conversations between candidate and assigned agent.
