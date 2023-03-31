# webapp

Cloud REST API Service Provider
A simple user management system built using Node.js, Express, and MySQL.

Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
Node.js
npm
MySQL
dotenv
Installing
Clone the repository:

bash
Copy code
git clone git@github.com:acedragneel/webapp.git 
Install the dependencies:

sql
Copy code
cd user-management-system
npm install
Create a .env file in the root directory of the project and add the following environment variables:

css
Copy code
DB_HOST=[database host]
DB_USER=[database user]
DB_PASSWORD=[database password]
DB_NAME=[database name]
Replace the placeholders with your database credentials.

Running the app
Start the application:

sql
Copy the code
npm start
The app should now be running at http://localhost:3000 or any port that is empty .

API Endpoints
The following are the available API endpoints:

GET /users/get: Get a user by email.
POST /users/create: Create a new user.
PUT /users/insert: Update an existing user.
Built With
Node.js
Express
MySQL
dotenv
bcrypt
fs
Author
Abhilash Gowdru Palakshappa
