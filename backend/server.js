const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// MySQL connection

const db = mysql.createConnection({
    host: 'colman-rds2.cryigiseobiw.eu-central-1.rds.amazonaws.com',
    user: 'admin',        // replace with your MySQL username
    password: 'Aa123456', // replace with your MySQL password
    database: 'colman'    // replace with your MySQL database name
  });

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Create users table if it doesn't exist
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    firstName VARCHAR(255),
    lastName VARCHAR(255)
  )
`;

db.query(createUsersTable, (err, result) => {
  if (err) {
    console.error('Error creating users table:', err);
    return;
  }
  console.log('Users table created or already exists');
});

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'API for managing users',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['./server.js'], // files containing annotations as above
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

// Route to handle user data
app.post('/users', (req, res) => {
  const { username, email, phone, firstName, lastName } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  const query = 'INSERT INTO users (username, email, phone_number, first_name, last_name) VALUES (?, ?, ?, ?, ?)';
  const values = [username, email, phone, firstName, lastName];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting user data:', err);
      return res.status(500).json({ error: 'Failed to insert user data' });
    }
    res.status(201).json({ message: 'User data inserted successfully', userId: result.insertId });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
