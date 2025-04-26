# EduJam AI

This is a full-stack application with a Spring Boot backend and Next.js frontend.

## Project Structure

```
EduJam-AI/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── EduJam/
│   │   │   │       └── AI/
│   │   │   │           ├── config/       # Configuration classes
│   │   │   │           ├── controller/   # REST controllers
│   │   │   │           ├── dto/          # Data Transfer Objects
│   │   │   │           ├── exception/    # Exception handlers
│   │   │   │           ├── model/        # Entity classes
│   │   │   │           ├── repository/   # JPA repositories
│   │   │   │           ├── security/     # Security configuration
│   │   │   │           ├── service/      # Business logic
│   │   │   │           └── util/         # Utility classes
│   │   │   └── resources/    # Application properties and resources
│   │   └── test/            # Test classes
│   ├── pom.xml              # Maven configuration
│   ├── mvnw                 # Maven wrapper
│   └── mvnw.cmd             # Maven wrapper for Windows
│
└── frontend/                # Next.js frontend
    ├── src/
    │   ├── app/             # Next.js app router pages
    │   ├── components/      # React components
    │   └── styles/          # CSS and styling
    ├── public/              # Static assets
    ├── package.json         # NPM dependencies
    ├── tsconfig.json        # TypeScript configuration
    ├── tailwind.config.js   # Tailwind CSS configuration
    └── postcss.config.js    # PostCSS configuration
```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build and run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- RESTful API with Spring Boot
- JPA/Hibernate for database operations
- Next.js 14 with App Router
- TypeScript for type safety![ChatGPT Image Apr 26, 2025, 01_25_07 PM](https://github.com/user-attachments/assets/23db07f7-0005-4514-9e1d-bb19eafab4d7)

- Tailwind CSS for styling
- Shadcn UI components
![Uploading ChatGPT Image Apr 26, 2025, 01_25_07 PM.png…]()

