## Bicycles API

A REST API developed as part of a vocational training project. The project is designed to manage bicycle information through a TypeScript, Node.js, Express, and Sequelize backend connected to a SQL database.

The API provides CRUD operations for bicycles and uses a relational database with separate brands and bicycles tables.

## Getting Started

These instructions will help you get a copy of the project running on your local machine for development and testing purposes.

## Prerequisites

Before starting, make sure you have the following software installed:

Node.js

npm

MySQL or another compatible MySQL database environment

Git, if you want to clone the repository

You can check whether Node.js and npm are installed with:

node --version
npm --version

You should also have access to a MySQL database in order to create the tables used by the API.

## Installing

Follow these steps to set up the project locally.

Clone the repository:

git clone <repository-url>

Move into the project directory:

cd FirstAPIEver_DSW

Install the project dependencies:

npm install

Create the database tables using the SQL script included in the project:

bd-bicycles-brands.sql

The SQL script creates two tables:

brands: stores bicycle brand information.

bicycles: stores bicycle information and links each bicycle to a brand through brandId.

The bicycles table includes the following main fields:

id
brandId
model
description
price
stock
createdAt
updatedAt

The relationship between the tables is protected by a foreign key. A bicycle must reference an existing brand, and deleting a brand that is still referenced by bicycles is restricted.

Configure the database connection according to the project's configuration.

## Start the API:

npm start

The API runs locally at:

http://localhost:3000

Once the server is running, the API can be used to perform CRUD operations on bicycle data.

For example, a GET request can be used to retrieve bicycle information:

GET http://localhost:3000/bicycles

The exact routes depend on the route configuration included in the application.

Running the tests

No automated test suite or dedicated test configuration is included in the provided project archive.

If tests are added later, they can be executed here using the test command configured in package.json.

Break down into end to end tests

End-to-end tests should verify the API as a complete system, including the HTTP routes, controllers, services, database operations, and responses.

Examples of useful end-to-end tests include:

GET    /bicycles       -> Retrieve bicycles
POST   /bicycles       -> Create a bicycle
PUT    /bicycles/:id   -> Update a bicycle
DELETE /bicycles/:id   -> Delete a bicycle

These tests help ensure that requests are correctly processed from the API endpoint through to the database.

And coding style tests

No dedicated coding-style or linting tests are included in the provided archive.

A linter such as ESLint could be added in the future to check TypeScript code for formatting problems, common errors, and consistent coding practices.

For example:

npm run lint

## Deployment

For a production deployment, the application should be hosted on a server capable of running Node.js and connected to a production MySQL database.

Before deployment:

Install the production dependencies.

Configure the production database connection.

Make sure the database schema has been created using bd-bicycles-brands.sql.

Configure the server port and other environment-specific settings.

Start the Node.js application using the appropriate production command.

The API should also be configured to use environment variables for sensitive database credentials instead of storing them directly in the source code.

Built With

TypeScript - Programming language used for the backend

Node.js - JavaScript runtime environment

Express - Web framework used to build the REST API

Sequelize - ORM used for database interaction

MySQL - Relational database system

## Contributing

This project was created as a vocational training project.

If you want to contribute, create a new branch for your changes, keep the code consistent with the existing project structure, and test your changes before submitting them.

Example:

git checkout -b feature/new-feature

Then commit your changes and open a pull request.

Versioning

This project does not currently include a documented versioning or release system.

For future releases, Semantic Versioning can be used to keep track of changes and releases.

## Authors
Haridian Vergara Alonso

## License

No specific license file is included in the provided project archive.

If this project is intended to be distributed publicly, a license such as the MIT License can be added in a LICENSE.md file.

## Acknowledgments

Created as part of a vocational training project.

Thanks to Tiburcio and learning resources used during the development of the project.

Thanks to the open-source technologies used to build the API, including TypeScript, Node.js, Express, Sequelize, and MySQL.

The included SQL script provides the database structure required for the bicycle and brand data.
