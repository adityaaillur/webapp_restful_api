# 🚀 Node.js REST API with Express.js

A robust and secure REST API built with Node.js and the Express.js framework, providing user management functionalities such as registration, retrieval, update, and deletion. Integrated Packer.

## 🔒 Secure Password Storage
The API ensures that user passwords are stored securely by validating inputs using the `express-validator` library and hashing the password using `bcrypt` before saving it in the MySQL database.

## 💾 Database Connection
The database connection is managed by the imported `connection` module and user information is stored in the `users` table.

## 📚 Required Libraries
The following libraries are used in the code and must be installed before running the API:

- `express`
- `bcrypt`
- `body-parser`
- `express-validator`
- `mysql2`

To install these libraries, run the following command in your terminal:

npm install <library name>

## 🚀 Running the API
To get started with the API, follow these steps:

1. Clone the repository to your local system.
2. Open the Command Prompt or Terminal in your system.
3. Navigate to the directory where the `app.js` file is located using the `cd` command.
4. Type the following command to run the file:

And that's it! You're now ready to start using the REST API. Happy coding!

