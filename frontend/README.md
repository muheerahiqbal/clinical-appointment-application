# ClinicCare frontend

Responsive React + Vite client for the clinic API. It uses the backend's `httpOnly` JWT cookie through Axios `withCredentials`; it does not persist bearer tokens in browser storage.

## Local development

1. Make sure the API is running from `../backend` on port `5000`.
2. No frontend `.env` is needed for local development; Axios defaults to `http://localhost:5000/api`. For a custom API, provide `VITE_API_URL` in the Vite environment or as a Docker build argument.
3. Run `npm install` and `npm run dev`, then visit `http://localhost:5173`.

The backend's doctor profile API accepts certificates but currently has no doctor-avatar upload route. Patient profile avatars are uploaded after patient registration to `POST /patients/me/avatar` with the `avatar` multipart field.

## Docker

From the project root, `docker compose up --build` runs the API and the production-built frontend. The frontend build receives `VITE_API_URL` as a Docker build argument; change it to the public API origin for a deployed build.
