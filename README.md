# Advanced MERN Full-Stack Application

This repository represents the **Level 3** iteration of the CodVeda User Manager. It extends the MERN stack (MongoDB, Express, React, Node) built in Level 2 with production-grade features including **GraphQL API**, **WebSockets for Real-Time Communication**, and **Performance Optimizations**.

---

## Features

### Task 1: Performance & Security Optimizations
- **Security Headers**: `helmet` for HTTP header hardening
- **Payload Compression**: `compression` for gzip responses
- **Rate Limiting**: `express-rate-limit` on auth routes to block brute-force attacks
- **Dynamic Environments**: `VITE_API_URL` env vars for deployment readiness

### Task 2: WebSockets for Real-Time Communication (Socket.io)
- **Authenticated WebSockets**: Socket connections require JWT verification
- **Live Dashboard Sync**: User additions/deletions broadcast to all connected clients
- **Toast Notifications**: Real-time animated notifications in the bottom-right corner

### Task 3: GraphQL API Development (Apollo Server + Client)
- **Apollo Server v4**: Full GraphQL schema with `typeDefs` and `resolvers`
- **Queries**: `users` (all), `user(id)` (single)
- **Mutations**: `signup`, `login`, `createUser`, `updateUser`, `deleteUser`
- **Authenticated Context**: JWT extracted from headers and injected into every resolver
- **Apollo Client v4**: React frontend uses `useQuery` and `useMutation` hooks
- **InMemoryCache**: Apollo's built-in caching optimizes repeated queries

## Technology Stack

- **Frontend**: React 19, Vite, Apollo Client, Socket.io-Client, React Router, Lucide Icons
- **Backend**: Node.js, Express.js, Apollo Server, Socket.io, MongoDB (Mongoose)
- **Security**: JWT, bcryptjs, Helmet, Compression, Rate Limiting

---

## Local Development Setup

### Backend
```bash
cd Backend
npm install
cp .env.example .env   # Configure MONGO_URI, JWT_SECRET
npm start
# Server runs at http://localhost:3000/graphql
```

### Frontend
```bash
cd Frontend
npm install
cp .env.example .env   # Configure VITE_API_URL
npm run dev
# App runs at http://localhost:5173
```

---

## GraphQL Playground

Once the backend is running, visit `http://localhost:3000/graphql` to open the Apollo Sandbox and test queries:

```graphql
# Example: Login
mutation {
  login(email: "admin@test.com", password: "password123") {
    token
    user { id name email role }
  }
}

# Example: Fetch all users (requires Authorization header)
query {
  users { id name email role createdAt }
}
```

---

## Deployment Guide

### Backend → Render
1. Create a Web Service on [Render.com](https://render.com)
2. Root Directory: `Backend`
3. Build: `npm install` | Start: `npm start`
4. Env Vars: `MONGO_URI`, `JWT_SECRET`

### Frontend → Vercel
1. Import repo on [Vercel.com](https://vercel.com)
2. Root Directory: `Frontend`
3. Env Var: `VITE_API_URL` = your Render backend URL