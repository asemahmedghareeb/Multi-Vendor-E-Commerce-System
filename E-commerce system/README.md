# Airport Management System

This is the backend for an Airport Management System, built with NestJS, GraphQL, PostgreSQL, and other modern technologies. It provides a comprehensive set of features for managing airports, flights, bookings, passengers, and staff.

## Features

*   **GraphQL API:** A flexible and powerful API for querying and mutating data.
*   **User Authentication:** Secure user authentication with JWT (JSON Web Tokens).
*   **Role-Based Access Control (RBAC):** Different roles (e.g., admin, staff, passenger) with different permissions.
*   **CRUD Operations:** Create, Read, Update, and Delete operations for all major entities.
*   **Flight Management:** Manage flights, including departure and arrival times, available seats, and status.
*   **Booking Management:** Book flights for passengers and manage existing bookings.
*   **Passenger Management:** Manage passenger information, including passport details and nationality.
*   **Staff Management:** Manage staff information, including employee ID, role, and assigned airport.
*   **Push Notifications:** Send push notifications to users with OneSignal.
*   **Email Notifications:** Send email notifications for events like booking confirmation.
*   **Pagination:** Paginated responses for large datasets.
*   **Dockerized:** The entire application is containerized with Docker for easy setup and deployment.

## Technologies

*   **Backend:**
    *   [NestJS](https://nestjs.com/) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
    *   [GraphQL](https://graphql.org/) - A query language for your API.
    *   [Apollo Server](https://www.apollographql.com/docs/apollo-server/) - A community-maintained open-source GraphQL server.
    *   [TypeORM](https://typeorm.io/) - A TypeScript ORM for PostgreSQL, MySQL, MariaDB, and more.
    *   [PostgreSQL](https://www.postgresql.org/) - A powerful, open source object-relational database system.
    *   [Redis](https://redis.io/) - An in-memory data structure store, used as a database, cache and message broker.
    *   [OneSignal](https://onesignal.com/) - A push notification service.
    *   [Nodemailer](https://nodemailer.com/) - A module for Node.js applications to allow easy as cake email sending.
    *   [JWT](https://jwt.io/) - A compact, URL-safe means of representing claims to be transferred between two parties.
*   **Development:**
    *   [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript that compiles to plain JavaScript.
    *   [Docker](https://www.docker.com/) - A platform for developing, shipping, and running applications in containers.
    *   [ESLint](https://eslint.org/) - A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript.
    *   [Prettier](https://prettier.io/) - An opinionated code formatter.
    *   [Jest](https://jestjs.io/) - A delightful JavaScript Testing Framework with a focus on simplicity.

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v16 or later)
*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/airport-management-system.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd airport-management-system
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the App

1.  Start the services (PostgreSQL and Redis) using Docker Compose:
    ```bash
    docker-compose up
    ```
2.  In a separate terminal, run the application:
    ```bash
    npm run start:dev
    ```

The application will be running at `http://localhost:3000`.

## API Documentation

The GraphQL API is self-documenting. You can access the GraphQL Playground at `http://localhost:3000/graphql` to explore the schema and run queries and mutations.

## Database Schema

The database schema is defined using TypeORM entities. The main entities are:

*   `Airport`: Represents an airport with a code, name, and city.
*   `Booking`: Represents a flight booking with a seat number, booking date, passenger, and flight.
*   `Flight`: Represents a flight with a flight number, airline, departure and arrival times, available seats, and status.
*   `Passenger`: Represents a passenger with a passport number, name, and nationality.
*   `Staff`: Represents a staff member with an employee ID, name, and role.
*   `User`: Represents a user with an email, password, and role.

## Project Structure

The project follows a modular structure, with each feature in its own directory under `src`.

```
src
├── airport
├── auth
├── booking
├── common
├── dataloader
├── emails
├── flight
├── passenger
├── push-notifications
└── staff
```

Each feature module typically contains:

*   `*.module.ts`: The NestJS module file.
*   `*.resolver.ts`: The GraphQL resolver.
*   `*.service.ts`: The business logic.
*   `dto/`: Data Transfer Objects for GraphQL inputs.
*   `entities/`: TypeORM entities.

## Scripts

The following scripts are available in the `package.json` file:

| Script | Description |
| --- | --- |
| `build` | Compiles the TypeScript code. |
| `format` | Formats the code using Prettier. |
| `start` | Starts the application. |
| `start:dev` | Starts the application in development mode with nodemon. |
| `start:debug` | Starts the application in debug mode. |
| `start:prod` | Starts the application in production mode. |
| `lint` | Lints the code using ESLint. |
| `test` | Runs unit tests. |
| `test:watch` | Runs unit tests in watch mode. |
| `test:cov` | Runs unit tests and generates a coverage report. |
| `test:debug` | Runs unit tests in debug mode. |
| `test:e2e` | Runs end-to-end tests. |

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the UNLICENSED License.




