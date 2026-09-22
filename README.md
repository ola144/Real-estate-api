# RealEstate API

Express and MongoDB API for the RealEstate property marketplace. The API supports customer, agent, and admin workflows including authentication, property listings, bookings, messaging, location lookups, dashboard statistics, and password recovery.

## Requirements

- Node.js 20 or newer
- MongoDB database
- Brevo account/API key for transactional email features
- Google OAuth credentials for Google sign-in

## Setup

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Create `config.env` in the server directory. The server loads this file when it starts:

    ```env
    PORT=5000
    MONGO_CONN_URL=mongodb://localhost:27017/real-estate
    JWT_SECRET=replace-with-a-long-random-secret
    JWT_EXPIRE_TIME=7d
    FRONTEND_URL=http://localhost:4200

    BREVO_API_KEY=your-brevo-api-key
    EMAIL_FROM=your-verified-sender@example.com
    GOGGLE_CLIENT_ID=your-google-client-id
    ```

    Keep `config.env` out of source control. Never commit database credentials, API keys, or email credentials.

    The Google verifier currently reads `GOGGLE_CLIENT_ID` (with the spelling shown above). Keep this name aligned with `src/utils/goggleAuth.js` until the environment variable is renamed in code.

3.  Start the development server:

    ```bash
    npm run dev
    ```

    The API is available at `http://localhost:5000`.

         Interactive Swagger documentation is available at `http://localhost:5000/api-docs` and the raw OpenAPI document is available at `http://localhost:5000/api-docs.json`.

4.  Optionally seed property data:

    ```bash
    npm run seed:properties
    ```

## Scripts

| Command                   | Description                          |
| ------------------------- | ------------------------------------ |
| `npm run dev`             | Start the API with Nodemon           |
| `npm run seed:properties` | Seed properties from the seed script |
| `npm test`                | Placeholder test command             |

## Authentication

Authentication uses a JWT stored in an HTTP-only `token` cookie. Send requests with credentials enabled:

```ts
fetch("http://localhost:5000/api/v1/auth/me", {
  credentials: "include",
});
```

Protected endpoints return `401` when the cookie is missing or invalid. Role-protected endpoints return `403` when the authenticated user does not have the required role.

### Swagger UI

Swagger UI documents the REST endpoints and their authentication requirements. After logging in through the API, the browser stores the HTTP-only `token` cookie and authenticated requests made from the same origin can use it automatically. The OpenAPI definition is maintained in `src/config/swagger.js`.

### Auth endpoints

| Method | Endpoint                | Access        | Description                                       |
| ------ | ----------------------- | ------------- | ------------------------------------------------- |
| `POST` | `/auth/register`        | Public        | Create a customer or agent account                |
| `POST` | `/auth/login`           | Public        | Sign in and set the auth cookie                   |
| `POST` | `/auth/logout`          | Public        | Clear the auth cookie                             |
| `POST` | `/auth/google`          | Public        | Sign in with a Google credential                  |
| `GET`  | `/auth/me`              | Authenticated | Get the current user                              |
| `POST` | `/auth/forgot-password` | Public        | Email a password reset link                       |
| `POST` | `/auth/reset-password`  | Public        | Set a new password using a reset token            |
| `POST` | `/auth/create-password` | Public        | Create an agent password from an invitation token |

Forgot-password request:

```json
{
  "email": "customer@example.com"
}
```

Reset-password request:

```json
{
  "token": "token-from-reset-link",
  "password": "new-password",
  "confirmPassword": "new-password"
}
```

## API routes

All endpoints below are relative to `/api/v1`.

### Properties

| Method   | Endpoint          | Access       |
| -------- | ----------------- | ------------ |
| `GET`    | `/properties`     | Public       |
| `GET`    | `/properties/:id` | Public       |
| `POST`   | `/properties`     | Admin, agent |
| `PATCH`  | `/properties/:id` | Agent        |
| `DELETE` | `/properties/:id` | Admin, agent |

### Bookings

| Method   | Endpoint                         | Access        |
| -------- | -------------------------------- | ------------- |
| `POST`   | `/bookings`                      | Authenticated |
| `GET`    | `/bookings`                      | Authenticated |
| `GET`    | `/bookings/:id`                  | Authenticated |
| `GET`    | `/bookings/agent/:agentId`       | Authenticated |
| `GET`    | `/bookings/customer/:customerId` | Authenticated |
| `PATCH`  | `/bookings/:id/update-status`    | Authenticated |
| `DELETE` | `/bookings/:id`                  | Authenticated |

### Agents

| Method  | Endpoint                           | Access       |
| ------- | ---------------------------------- | ------------ |
| `GET`   | `/agents`                          | Public       |
| `GET`   | `/agents/:id`                      | Public       |
| `POST`  | `/agents`                          | Admin        |
| `PATCH` | `/agents/:id`                      | Admin, agent |
| `PATCH` | `/agents/:id/deactivate`           | Admin        |
| `PATCH` | `/agents/:id/activate`             | Admin        |
| `POST`  | `/agents/:id/resend-password-link` | Public       |
| `GET`   | `/agents/properties/:id`           | Agent        |
| `GET`   | `/agents/dashboard/statistics`     | Agent        |

### Messaging

| Method  | Endpoint                                       | Access        |
| ------- | ---------------------------------------------- | ------------- |
| `POST`  | `/messages/conversations`                      | Authenticated |
| `GET`   | `/messages/conversations`                      | Authenticated |
| `POST`  | `/messages`                                    | Authenticated |
| `GET`   | `/messages/conversations/:conversationId`      | Authenticated |
| `PATCH` | `/messages/conversations/:conversationId/read` | Authenticated |
| `GET`   | `/messages/unread-count`                       | Authenticated |

### Locations and dashboards

| Method | Endpoint                                    | Access |
| ------ | ------------------------------------------- | ------ |
| `GET`  | `/locations/countries`                      | Public |
| `GET`  | `/locations/states/:countryCode`            | Public |
| `GET`  | `/locations/cities/:countryCode/:stateCode` | Public |
| `GET`  | `/admin/dashboard/statistics`               | Admin  |

## Health check

```http
GET /api/v1/health
```

Returns a simple service status response:

```json
{
  "success": true,
  "message": "Real Estate API is running"
}
```

## Real-time messaging

The HTTP server also initializes Socket.IO for real-time chat. Connect the client to the API origin and include credentials when required by the client integration.

## Project structure

```text
src/
├── Controllers/   Request handlers
├── Middleware/    Authentication, roles, errors, uploads
├── Models/        Mongoose models
├── Routes/        Express route definitions
├── config/        Database configuration
├── seed/          Database seed scripts
├── socket/        Socket.IO setup
└── utils/         Email, token, and shared helpers
```
