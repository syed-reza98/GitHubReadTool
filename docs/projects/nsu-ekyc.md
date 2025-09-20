# NSU eKYC

Overview

Student KYC (Know Your Customer) system built to provide verified student records to external organizations (banks, hospitals) via APIs.

Code

- Backend implemented with Laravel (PHP). Provides REST endpoints for retrieval and verification.
- Database: MySQL. Uses structured schemas to store student details and verification metadata.

Architecture

- Monolithic Laravel application with modular routes and controllers for KYC operations.
- API authentication with token-based access for external clients.

Tech stack

- PHP (Laravel), MySQL, Postman for API testing

Status

- Functional API integration and sample deployments. Designed for secure data exchange and audit logging.
