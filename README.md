# Lumora Backend API

A Node.js Express API for handling enquiry submissions with MySQL database integration.

## Features

- ✅ Express.js REST API
- ✅ MySQL database connection with connection pooling
- ✅ Input validation with express-validator
- ✅ CORS support
- ✅ Environment variable validation
- ✅ Error handling middleware
- ✅ Health check endpoint

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   - Create a MySQL database named `lumora`
   - Run the database setup script:
     ```sql
     mysql -u your_username -p lumora < database/setup.sql
     ```
   - Or manually execute the SQL commands in `database/setup.sql`

4. Create a `.env` file with the following variables:
   ```env
   PORT=4000
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=lumora
   ```

## Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 4000).

## API Endpoints

### Health Check

- **GET** `/health`
- Returns server status and timestamp

### Submit Enquiry

- **POST** `/api/enquiry`
- Content-Type: `application/json`

**Request Body:**

```json
{
  "name": "John Doe",
  "mail": "john@example.com",
  "phone": "1234567890",
  "message": "Your message here"
}
```

**Validation Rules:**

- `name`: Required, non-empty string
- `mail`: Required, valid email format
- `phone`: Required, 10-15 characters
- `message`: Required, non-empty string

**Success Response (200):**

```json
{
  "message": "Data inserted successfully",
  "success": true
}
```

**Validation Error Response (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Name is required",
      "path": "name",
      "location": "body"
    }
  ]
}
```

**Database Error Response (500):**

```json
{
  "error": "Database error",
  "success": false,
  "message": "Error details"
}
```

## Database Schema

### Table Structure

```sql
CREATE TABLE inquiry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  mail VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Stored Procedure

The API uses a stored procedure `insert_inquiry`:

```sql
CALL insert_inquiry('John Doe', 'john@example.com', '1234567890', 'Message text');
```

The complete database schema and setup scripts are available in the `database/` directory.

## Project Structure

```
├── config/
│   ├── db.js              # Database connection pool
│   └── validateEnv.js     # Environment validation
├── controllers/
│   └── commonController.js # Request handlers
├── database/
│   ├── schema.sql         # Complete database schema
│   └── setup.sql          # Quick setup script
├── router/
│   └── commonRouter.js    # Route definitions
├── validators/
│   └── inpurValidator.js  # Input validation rules
├── server.js              # Main application file
├── package.json
├── README.md
└── .env                   # Environment variables
```

## Error Handling

The application includes comprehensive error handling:

- Input validation errors
- Database connection errors
- 404 route not found
- Global error handler for unexpected errors

## CORS

CORS is enabled for all origins. In production, consider restricting to specific domains.

## Development

The project uses nodemon for development with hot reloading. Any changes to the code will automatically restart the server.
