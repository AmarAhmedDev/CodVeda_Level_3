# Simple REST API

This repository contains a simple REST API built using **Node.js** and **Express**. It implements basic CRUD (Create, Read, Update, Delete) operations for a `users` resource using an in-memory data store.

## Objectives Achieved
- Set up an Express server.
- Created API routes for CRUD operations (`GET`, `POST`, `PUT`, `DELETE`).
- Returns proper HTTP status codes and handles basic errors.

## Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation
1. Clone this repository (if you haven't already).
2. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the Server
You can start the server by running:
```bash
npm start
```
By default, the server runs on `http://localhost:3000`.

## API Endpoints

Use a tool like **Postman** or **Thunder Client** to test the following endpoints.

### Users Resource

| Method | Endpoint | Description | Request Body (JSON) | Success Status |
|---|---|---|---|---|
| `GET` | `/users` | Get all users | None | `200 OK` |
| `GET` | `/users/:id` | Get a single user by ID | None | `200 OK` |
| `POST` | `/users` | Create a new user | `{"name": "...", "email": "..."}` | `201 Created` |
| `PUT` | `/users/:id` | Update an existing user | `{"name": "...", "email": "..."}` | `200 OK` |
| `DELETE` | `/users/:id` | Delete a user by ID | None | `200 OK` |

### Error Responses
- `400 Bad Request`: If required fields are missing during creation or update.
- `404 Not Found`: If a user with the specified ID does not exist.