# eConnectOne Solution

## Overview

eConnectOne is a comprehensive, full-stack solution designed for modern business management, featuring robust user management, broadcast messaging, session control, and a visually attractive client demo. The solution is modular, scalable, and built with industry-standard technologies for both backend and frontend.

---

## Technologies Used

### Backend
- **ASP.NET Core (C#)**: Main backend framework for building RESTful APIs and business logic.
- **Entity Framework Core**: ORM for database access and migrations.
- **PostgreSQL**: Relational database for persistent data storage.
- **.NET Dependency Injection**: For modular, testable service architecture.
- **Middleware**: Custom middleware for rate limiting, authentication, and more.

### Frontend
- **React**: Modern JavaScript library for building user interfaces.
- **TypeScript**: Strongly-typed superset of JavaScript for safer, scalable code.
- **Material UI (MUI)**: Component library for fast, beautiful, and accessible UI.
- **Vite**: Lightning-fast frontend build tool and dev server.
- **Axios**: Promise-based HTTP client for API communication.

### DevOps & Tooling
- **npm**: Node.js package manager for frontend dependencies.
- **dotnet CLI**: .NET Core command-line tools for backend build and run.
- **ESLint**: Linting for code quality and consistency (frontend).
- **PowerShell**: Scripts for starting and managing the solution.

---

## Solution Structure

```
eConnectOne.sln                # Solution file
start-app.ps1                  # PowerShell script to start the app
backend/
  eConnectOne.API/             # ASP.NET Core Web API project
    Controllers/               # API controllers
    Data/                      # EF Core DbContext and migrations
    DTOs/                      # Data transfer objects
    Middleware/                # Custom middleware
    ...
frontend/
  src/                         # React source code
    components/                # UI components
    pages/                     # App pages (e.g., Demo, Broadcasts)
    services/                  # API and business logic
    ...
  public/                      # Static assets
  package.json                 # Frontend dependencies
  vite.config.ts               # Vite configuration
```

---

## Key Features
- **User Management**: Secure authentication, role-based access, and user CRUD.
- **Broadcast Messaging**: Send, edit, delete, and view broadcasts (admin & user views).
- **Session Timer**: Automatic session timeout with warning popup and reset.
- **Role & Permission System**: (Configurable) for menu and feature access.
- **Modern UI/UX**: Responsive, attractive, and client-focused design.
- **Demo Page**: Showcases all features, technical details, and client value.

---

## Getting Started

1. **Backend**
   - Prerequisites: [.NET 6+](https://dotnet.microsoft.com/), [PostgreSQL](https://www.postgresql.org/)
   - Configure connection string in `backend/eConnectOne.API/appsettings.json`.
   - Run migrations and start API:
     ```powershell
     cd backend/eConnectOne.API
     dotnet ef database update
     dotnet run
     ```

2. **Frontend**
   - Prerequisites: [Node.js & npm](https://nodejs.org/)
   - Install dependencies and start dev server:
     ```powershell
     cd frontend
     npm install
     npm run dev
     ```

3. **Demo**
   - Access the Demo page from the main menu to explore all features and technical highlights.

---

## Contact & Support
For questions, support, or demo requests, please contact the development team.

---

© 2025 eConnectOne. All rights reserved.
