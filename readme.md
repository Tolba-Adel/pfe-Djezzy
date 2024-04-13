## Prerequisites

- Node.js
- MySQL

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/Tolba-Adel/pfe-Djezzy
   ```

2. Navigate to the project directory:

   ```bash
   cd pfe-Djezzy
   ```

3. Install the dependencies listed in the `package.json` file:

   ```bash
   npm install
   ```

4. Set up the MySQL database:

   - Adjust the MySQL connection pool configuration in the `db.js` file to utilize your MySQL credentials stored in a `.env` file.

5. Seed the database:
   ```bash
   npm run seed
   ```

6. Start the application:

   ```bash
   npm start
   ```

7. Access the app:

   You can access the app through the URL `http://127.0.0.1:3000/`

## User Roles

   After seeding the database an admin account is created with the following credentials:
   - **Username**: Administrateur
   - **Password**: 00000