# parcel_tracker_api_demo

# SCM Application Demo

## Overview

This repository contains a demonstration showcasing the core functionalities of a Supply Chain Management (SCM), Logistics Management application. This project is intended for portfolio purposes to illustrate my skills in backend development with Node.js and Express, database design with MongoDB, API development, data handling.

The demo focuses on providing a glimpse into the essential features designed to streamline the currently used handwritten parcel order tracking and verification process at Me Me Cosmetics, aiming for faster and more efficient operations through robust management tools and insightful data analysis.

## Key Features Demonstrated

This demo highlights the following core functionalities:

- **User Authentication and Authorization:**

- Description
  Allows users to securely log in and log out using an account name and password.
  Supports two roles—Admin and Staff—each granted access based on their
  credentials.

- Benefits
  ● Enforces secure access to the system
  ● Enables role‑based permissions for sensitive operations

- **Account Management :**

- Description​
  Enables Admin users to create, update and manage Staff accounts. Admins can set
  or reset staff passwords and maintain full control over account permissions.

- Benefits
  ●​ Streamlines onboarding and offboarding of team members​
  ●​ Centralizes user‑provisioning for consistent security policies​

- **Parcel Creation:**

- Description
  Lets a user record a new parcel for delivery, capturing:
  ● Parcel details
  ● Payment information (method)
  ● Customer information (name, address)
  ● Delivery date, pricing, and service selections
  ● Creator’s identity for audit trail

- Benefits
  ●​ Digitizes every shipment in one form, reducing data entry errors​
  ●​ Provides a clear record for billing and tracking purposes​

- **Delivery Batch Managment:**

- Description
  Lets a user record a new parcel for delivery, capturing:
  ● Parcel details
  ● Payment information (method)
  ● Customer information (name, address)
  ● Delivery date, pricing, and service selections
  ● Creator’s identity for audit trail

- Benefits
  ● Digitizes every shipment in one form, reducing data entry errors
  ● Provides a clear record for billing and tracking purposes

- **Parcel Status Tracking:**

- Description
  Lets a user record a new parcel for delivery, capturing:
  ● Parcel details
  ● Payment information (method)
  ● Customer information (name, address)
  ● Delivery date, pricing, and service selections
  ● Creator’s identity for audit trail

- Benefits
  ● Digitizes every shipment in one form, reducing data entry errors
  ● Provides a clear record for billing and tracking purposes

- **Sale Report and Staff KPI Calculation:**

- Description
  Enables Admins to generate reports over any date range, showing:● Total sales amount
  ● Lists of successful versus cancelled orders
  ● Breakdown of monthly sales by staff (both item count and revenue)

- Benefits
  ● Offers actionable insights into team performance
  ● Supports data‑driven decisions on staffing and incentives

- **Advance Filter, Query, and Search Engine:**

- Description
  Ease of use for filtering and searching data.
  Complex query parameters for advanced filtering.
  Quick Date range search.
  Optimized search engine for quick record customer.

- Benefits
  ● Enables efficient data retrieval based on specific criteria
  ● Supports complex queries for advanced filtering
  ● Improves user experience with quick record location

## Technologies Used

This demo was built using the following technologies:

- **Backend:** Node.js with Express.js
- **Database:** MongoDB

## Intended Audience

This demonstration is primarily intended for:

- Potential employers looking to assess my technical skills and understanding of backend development, database design, API development, SCM concepts.
- Other developers interested in seeing an implementation of these core SCM functionalities.

## Disclaimer

This is a simplified demonstration created for portfolio purposes. It may not represent the full complexity or robustness of a production-ready application.

## Contact

Email : aungthuyeinhein98@gmail.com
Contact : +959451315280
WebAddress : https://aungthuyeinhein.vercel.app/
GitHub : https://github.com/AungThuyeinHein/

## License

This project is licensed under the [MIT License](LICENSE).

# Project Title (Parcel Tracker API Demo)

## Installation Guide

This guide will walk you through the necessary steps to get the project up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Git:** For cloning the repository. You can download it from [https://git-scm.com/downloads](https://git-scm.com/downloads).
- **Node.js and npm:** npm is bundled with Node.js. You can download Node.js from [https://nodejs.org/en/download/](https://nodejs.org/en/download/). It is recommended to use a recent LTS version.

This is developed in Node Version of(v22.14.0(LTS))
NPM version (11.1.0)

### Getting Started

1.  **Clone the repository:** Open your terminal or command prompt and run the following command to clone the project repository:

    ```bash
    git clone https://github.com/AungThuyeinHein/parcel_tracker_api_demo.git
    ```

2.  **Navigate to the project directory:** Change into the cloned repository's directory:

    ```bash
    cd parcel_tracker_api_demo
    ```

3.  **Install dependencies:** Install the project's dependencies using npm:

    ```bash
    npm install
    ```

### Configuration

4.  **Create a `.env` file:** In the root directory of the project, create a file named `.env`. This file will store your environment variables.

5.  **Add environment variables:** Add the following variables to your `.env` file, replacing the placeholder values with your actual configuration:

    ```env
    MONGODB_URI=your_mongodb_connection_string
    SESSION_SECRET=your_random_session_secret
    LOGIN_EXPIRES="1h"
    SECRET_STR=your_random_secret_string
    ```

    - `MONGODB_URI`: Your MongoDB connection string. This is required to connect to your database.
    - `SESSION_SECRET`: A random string used to sign the session ID cookie. This helps protect against session hijacking. **Ensure this is a strong, randomly generated string and keep it confidential.**
    - `LOGIN_EXPIRES`: Sets the expiration time for the login session. `1h` means one hour. You can adjust this value as needed (e.g., `7d` for 7 days).
    - `SECRET_STR`: Another random string used for additional security purposes within the application. **Ensure this is also a strong, randomly generated string and keep it confidential.**

### Running the Application

Once the dependencies are installed and the `.env` file is configured, you can start the application by running:

Development (or) Debug mode:

```bash
npm run dev
```

Production mode:

```bash
npm run prod
```

Admin username

```bash
aung
```

Admin password

```bash
aung
```
