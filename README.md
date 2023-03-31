This is a guide on how to install and run a simple user management system web application built using Node.js, Express, and MySQL.
To get started, you need to have Node.js, npm, MySQL, and dotenv installed. 
Once you have cloned the repository, you should install the dependencies by running 'npm install' command in the 'user-management-system' directory.

After that, you should create a .env file in the root directory of the project and add the necessary environment variables for the database credentials, 
including DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME. Replace the placeholders with your database credentials.

To run the application, you should start it by running the 'npm start' command in the 'user-management-system' directory.
The application should now be running on http://localhost:8000 or any other empty port.

The application provides three API endpoints for managing user data, including GET /users/get to retrieve a user by email, POST /users/create to create a new user, and PUT /users/insert to update an existing user. These endpoints can be accessed via HTTP requests and can be used to perform CRUD (Create, Read, Update, Delete) operations on user data.

Changes for demo updated


