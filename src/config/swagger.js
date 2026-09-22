const swaggerDefinition = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "RealEstate API",
      version: "1.0.0",
      description:
        "API for property discovery, bookings, messaging, authentication, and role-based real estate management.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication and password recovery" },
      { name: "Properties", description: "Property listings" },
      { name: "Bookings", description: "Property bookings" },
      { name: "Agents", description: "Agent management" },
      { name: "Locations", description: "Country, state, and city lookups" },
      { name: "Admin", description: "Administrator dashboard data" },
    ],
    components: {
      securitySchemes: {
        authCookie: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "HTTP-only JWT cookie set by the login endpoint.",
        },
      },
      schemas: {
        MessageResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Request completed successfully.",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong." },
          },
        },
        PasswordResetRequest: {
          type: "object",
          required: ["token", "password", "confirmPassword"],
          properties: {
            token: { type: "string" },
            password: { type: "string", format: "password", minLength: 8 },
            confirmPassword: {
              type: "string",
              format: "password",
              minLength: 8,
            },
          },
        },
      },
      parameters: {
        Id: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      },
      responses: {
        Unauthorized: {
          description: "Authentication required or token invalid.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        Forbidden: {
          description: "Authenticated user does not have permission.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    paths: {
      "/api/v1/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Create an account",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string", format: "password" },
                    phone: { type: "string" },
                    role: { type: "string", enum: ["customer", "agent"] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Account created." },
            400: { description: "Invalid input." },
            409: { description: "Email already exists." },
          },
        },
      },
      "/api/v1/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Sign in",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", format: "password" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Signed in and token cookie set." },
            401: { description: "Invalid credentials." },
          },
        },
      },
      "/api/v1/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Sign out",
          responses: { 200: { description: "Token cookie cleared." } },
        },
      },
      "/api/v1/auth/google": {
        post: {
          tags: ["Auth"],
          summary: "Sign in with Google",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["credential"],
                  properties: { credential: { type: "string" } },
                },
              },
            },
          },
          responses: {
            200: { description: "Signed in." },
            401: { description: "Invalid Google credential." },
          },
        },
      },
      "/api/v1/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get the current user",
          security: [{ authCookie: [] }],
          responses: {
            200: { description: "Current user returned." },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/v1/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Request a password reset link",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: { email: { type: "string", format: "email" } },
                },
              },
            },
          },
          responses: { 200: { description: "Reset instructions requested." } },
        },
      },
      "/api/v1/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Reset a password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PasswordResetRequest" },
              },
            },
          },
          responses: {
            200: { description: "Password reset." },
            400: { description: "Invalid or expired token." },
          },
        },
      },
      "/api/v1/auth/create-password": {
        post: {
          tags: ["Auth"],
          summary: "Create an invited agent password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PasswordResetRequest" },
              },
            },
          },
          responses: {
            200: { description: "Password created." },
            400: { description: "Invalid or expired setup token." },
          },
        },
      },
      "/api/v1/properties": {
        get: {
          tags: ["Properties"],
          summary: "List properties",
          responses: { 200: { description: "Properties returned." } },
        },
        post: {
          tags: ["Properties"],
          summary: "Create a property",
          security: [{ authCookie: [] }],
          responses: {
            201: { description: "Property created." },
            401: { $ref: "#/components/responses/Unauthorized" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },
      "/api/v1/properties/{id}": {
        get: {
          tags: ["Properties"],
          summary: "Get a property",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Property returned." },
            404: { description: "Property not found." },
          },
        },
        patch: {
          tags: ["Properties"],
          summary: "Update a property",
          security: [{ authCookie: [] }],
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Property updated." },
            401: { $ref: "#/components/responses/Unauthorized" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
        delete: {
          tags: ["Properties"],
          summary: "Delete a property",
          security: [{ authCookie: [] }],
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Property deleted." },
            401: { $ref: "#/components/responses/Unauthorized" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },
      "/api/v1/bookings": {
        post: {
          tags: ["Bookings"],
          summary: "Create a booking",
          security: [{ authCookie: [] }],
          responses: {
            201: { description: "Booking created." },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
        get: {
          tags: ["Bookings"],
          summary: "List bookings",
          security: [{ authCookie: [] }],
          responses: {
            200: { description: "Bookings returned." },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/v1/bookings/{id}": {
        get: {
          tags: ["Bookings"],
          summary: "Get a booking",
          security: [{ authCookie: [] }],
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Booking returned." },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
        delete: {
          tags: ["Bookings"],
          summary: "Delete a booking",
          security: [{ authCookie: [] }],
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Booking deleted." },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/v1/bookings/{id}/update-status": {
        patch: {
          tags: ["Bookings"],
          summary: "Update booking status",
          security: [{ authCookie: [] }],
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Booking status updated." },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/v1/bookings/agent/{agentId}": {
        get: {
          tags: ["Bookings"],
          summary: "List bookings for an agent",
          security: [{ authCookie: [] }],
          parameters: [
            {
              name: "agentId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Bookings returned." },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/v1/bookings/customer/{customerId}": {
        get: {
          tags: ["Bookings"],
          summary: "List bookings for a customer",
          security: [{ authCookie: [] }],
          parameters: [
            {
              name: "customerId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Bookings returned." },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/v1/agents": {
        get: {
          tags: ["Agents"],
          summary: "List agents",
          responses: { 200: { description: "Agents returned." } },
        },
        post: {
          tags: ["Agents"],
          summary: "Create an agent",
          security: [{ authCookie: [] }],
          responses: {
            201: { description: "Agent created." },
            401: { $ref: "#/components/responses/Unauthorized" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },
      "/api/v1/agents/{id}": {
        get: {
          tags: ["Agents"],
          summary: "Get an agent",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: { 200: { description: "Agent returned." } },
        },
        patch: {
          tags: ["Agents"],
          summary: "Update an agent",
          security: [{ authCookie: [] }],
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Agent updated." },
            401: { $ref: "#/components/responses/Unauthorized" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },
      "/api/v1/agents/{id}/resend-password-link": {
        post: {
          tags: ["Agents"],
          summary: "Resend agent password link",
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: { 200: { description: "Password link sent." } },
        },
      },
      "/api/v1/agents/{id}/deactivate": {
        patch: {
          tags: ["Agents"],
          summary: "Deactivate an agent",
          security: [{ authCookie: [] }],
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Agent deactivated." },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },
      "/api/v1/agents/{id}/activate": {
        patch: {
          tags: ["Agents"],
          summary: "Activate an agent",
          security: [{ authCookie: [] }],
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Agent activated." },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },
      "/api/v1/agents/properties/{id}": {
        get: {
          tags: ["Agents"],
          summary: "List an agent's properties",
          security: [{ authCookie: [] }],
          parameters: [{ $ref: "#/components/parameters/Id" }],
          responses: {
            200: { description: "Properties returned." },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },
      "/api/v1/agents/dashboard/statistics": {
        get: {
          tags: ["Agents"],
          summary: "Get agent dashboard statistics",
          security: [{ authCookie: [] }],
          responses: {
            200: { description: "Statistics returned." },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },
      "/api/v1/locations/countries": {
        get: {
          tags: ["Locations"],
          summary: "List countries",
          responses: { 200: { description: "Countries returned." } },
        },
      },
      "/api/v1/locations/states/{countryCode}": {
        get: {
          tags: ["Locations"],
          summary: "List states for a country",
          parameters: [
            {
              name: "countryCode",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "States returned." } },
        },
      },
      "/api/v1/locations/cities/{countryCode}/{stateCode}": {
        get: {
          tags: ["Locations"],
          summary: "List cities for a state",
          parameters: [
            {
              name: "countryCode",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "stateCode",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Cities returned." } },
        },
      },
      "/api/v1/admin/dashboard/statistics": {
        get: {
          tags: ["Admin"],
          summary: "Get admin dashboard statistics",
          security: [{ authCookie: [] }],
          responses: {
            200: { description: "Statistics returned." },
            401: { $ref: "#/components/responses/Unauthorized" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerDefinition;
