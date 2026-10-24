# Quiz Application

A full-stack quiz application with a React frontend and a Spring Boot backend. Users can browse quiz filters, take quizzes, and play a KBC-style game. The backend stores questions and game state in MongoDB and can import questions from external trivia services.

## Requirements

- Java 17
- Node.js and npm
- MongoDB running at `mongodb://localhost:27017`

## Configuration

Create `backend/.env` with the backend settings:

```properties
QUIZ_API_APIKEY=your-quizapi-key
ADMIN_PASSWORD=choose-a-local-admin-password
```

Create `frontend/.env` with the backend URL:

```properties
VITE_API_URL=http://localhost:9092
```

Environment files are ignored by Git. Keep real credentials out of commits.

## Run Locally

From the `backend` directory, start the API:

```powershell
.\mvnw.cmd spring-boot:run
```

On macOS or Linux, use `./mvnw spring-boot:run`. The API listens on port `9092`.

In a separate terminal, from the `frontend` directory, start the web app:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Checks

Run backend tests from `backend`:

```powershell
.\mvnw.cmd test
```

Run frontend lint and production build from `frontend`:

```powershell
npm run lint
npm run build
```

## Project Layout

- `backend/`: Spring Boot API, MongoDB persistence, and trivia question importers.
- `frontend/`: React application built with Vite.
- `backend/API_and_Schema_Docs.md`: API and data-schema notes.
