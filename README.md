# ⚙️ EventHub - Robust Backend Core (API Server)

The secure, highly-scalable, and production-ready backend engine power behind **EventHub**. Built using **Node.js**, **Express.js**, **TypeScript**, and **MongoDB**, this API server handles complex search, filtering pipelines, session-based authentication parsing, and strict middleware verification.

---

## 🛠️ Core Technology Stack
- **Runtime Environment:** Node.js
- **Language Layer:** TypeScript (Strict Type Contexts)
- **Server Architecture:** Express.js
- **Database Engine:** MongoDB (Native Driver Integration)
- **Environment Management:** Dotenv
- **Security Utilities:** CORS Module Integration

---

## 🚀 Key Architectural Layouts

### 1. Robust Token & Session Verification Engine (`verifyToken`)
- Built-in Custom Authorization header validation workflow.
- Performs secure splits on multi-segment schema structures to fetch user authorization tokens.
- Runs runtime verification pipelines directly across active db session records to find `userId` data without performance overhead.
- Extends the baseline Express `Request` scope safely using custom type extensions (`CustomRequest`) to pass the verified `user` object into subsequent routes.

### 2. Advanced Multi-Filter Query Architecture
- **Complex Regex Search Parsing:** Combines multiple search dimensions under a single query, performing case-insensitive matching across `title`, `shortDescription`, and `category`.
- **Adaptive Sorting Metrics:** Dynamically shifts MongoDB sorting operations based on requested contexts (`Newest`, `Oldest`, `PriceLowToHigh`, `PriceHighToLow`).
- **Pagination Optimization:** Uses math bounds (`skip` and `limit`) calculated from incoming page parameters while computing total aggregate document counts concurrently.

---

## 🗺️ API Endpoint Matrix

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| **GET** | `/` | ❌ | Base server ping endpoint. |
| **POST** | `/api/events` | 🔒 **Yes** | Inserts a new event document into the database. |
| **GET** | `/api/events` | ❌ | Fetches events with complete Search, Filter, Sort, and Pagination handling. |
| **GET** | `/api/events/featured` | ❌ | Returns top 8 trending/featured events. |
| **GET** | `/api/events/:id` | ❌ | Fetches comprehensive details for a specific event by its ObjectId. |
| **GET** | `/api/events/user/:userId` | 🔒 **Yes** | Returns all events managed/created by a specific user account. |
| **DELETE**| `/api/events/:id` | 🔒 **Yes** | Remotely purges a targeted event from the collection database. |

