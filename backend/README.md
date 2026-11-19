# Clinic Appointment Management API

REST API built with Node.js, Express, MongoDB/Mongoose, JWT, Passport, and Cloudinary. All appointment dates use UTC (`YYYY-MM-DD`); a doctor's weekly availability is keyed by UTC weekday (Sunday `0` through Saturday `6`). Slots must align to the doctor's configured slot duration.

## Run locally

1. Use Node.js 20+ and MongoDB Atlas or a local MongoDB instance.
2. Keep a single `.env` at the project root, next to `docker-compose.yml`. Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and the Cloudinary credentials used for uploads. `server.js` and `scripts/createAdmin.js` load that file relative to their own paths.
3. From `backend/`, run `npm install`, then `npm start`. The API listens on port `5000` by default.
4. To create the first admin, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the same project-root `.env`, then run `node scripts/createAdmin.js`. Public registration cannot create admin accounts.

Local MongoDB SRV lookups use Cloudflare DNS (`1.1.1.1`) with Google DNS (`8.8.8.8`) as a fallback. Vercel uses its platform DNS resolver.

`npm run dev` starts the API with Nodemon. The API creates declared indexes on startup (including the unique active-doctor-slot index); the MongoDB user must have permission to create indexes.

## Docker

The project `docker-compose.yml` reads the project-root `.env`, builds both app folders, and starts the frontend and API. Configure a sufficiently long `JWT_SECRET` and Cloudinary credentials, then run `docker compose up --build` from this project folder.

## Deploy the backend to Vercel

Create a separate Vercel project for this repository and set its Root Directory to `backend`. Vercel serves the Express app exported from `index.js`; `server.js` remains the local/Docker entry point. Set the environment variables listed below in the Vercel project rather than copying the root `.env`.

Required Vercel environment variables:

- `MONGODB_URI`
- `JWT_SECRET` (at least 32 characters)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLIENT_URL=https://clinical-appointment-application.vercel.app`
- `COOKIE_SECURE=true`
- `UPLOAD_MAX_BYTES=4194304` (4 MiB, to leave room for multipart overhead under Vercel's request-size limit)

Optional variables: `JWT_EXPIRES_IN` (defaults to `1d`), `RATE_LIMIT_WINDOW_MS` (defaults to 15 minutes), and `CORS_ORIGINS` (comma-separated additional origins). Vercel sets `NODE_ENV` and `VERCEL` for deployed functions. The API also allows `http://localhost:5173` for local development.

After the backend deploys, set `VITE_API_URL=https://<your-backend-domain>/api` in the existing frontend Vercel project and redeploy the frontend. Allow the Vercel backend's outbound access to MongoDB Atlas in Atlas Network Access. Production JWT cookies use `SameSite=None; Secure` because the frontend and backend are on separate Vercel origins.

## Authentication and security

- Login and registration return a JWT and set it in an `httpOnly` cookie. Local development uses `SameSite=Strict`; production uses `SameSite=None; Secure` for the separate Vercel frontend and API origins.
- Clients that cannot use cookies may send `Authorization: Bearer <token>`.
- Configure `CORS_ORIGINS` as a comma-separated allowlist. Requests without an `Origin` header are allowed for non-browser clients.
- Rate limiting applies to login and registration in production only; development requests and other API routes are not rate limited.
- Public registration accepts only `patient` or `doctor`; doctor accounts remain unavailable for public browsing until an admin verifies them. Passwords must be at least 12 characters and no more than 72 UTF-8 bytes (bcrypt's input limit).
- File uploads use Multer memory storage and Cloudinary; accepted MIME types are JPEG, PNG, WebP, or PDF and the size is bounded by `UPLOAD_MAX_BYTES`.
- Locally, error and administrative audit entries are appended to `logs/error.log` and `logs/audit.log`; on Vercel, they are sent to function runtime logs.

## Main endpoints

All API routes are under `/api`; send and receive JSON except multipart file uploads.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register patient or doctor (doctor fields: `specialization`, `experience`, `fees`; optional `certificate` file) |
| POST | `/auth/login` | Public | Sign in |
| POST | `/auth/logout` | Public | Clear auth cookie |
| GET | `/auth/me` | Authenticated | Current account |
| GET | `/doctors?specialization=...` | Public | Browse verified doctors (paginated) |
| GET | `/doctors/:id` | Public | View verified doctor |
| GET/PATCH | `/doctors/me/profile` | Doctor | View/update profile and weekly availability |
| PATCH | `/patients/me/profile` | Patient | Update patient name |
| POST | `/patients/me/avatar` | Patient | Upload `avatar` image |
| POST | `/appointments` | Patient | Book using `doctorId`, `date`, `timeSlot`, `symptoms` |
| GET | `/appointments/mine` | Patient/Doctor | List own appointments; optional `status`, `page`, `limit` |
| PATCH | `/appointments/:id/cancel` | Patient | Cancel own active appointment |
| PATCH | `/appointments/:id/respond` | Doctor | Approve/reject pending appointment with optional `notes` |
| GET | `/admin/statistics` | Admin | Aggregate system counts |
| GET/PATCH/DELETE | `/admin/doctors` and `/admin/doctors/:id...` | Admin | List, verify (`{ "approved": true }`), or delete doctors |
| GET/DELETE | `/admin/patients` and `/admin/patients/:id` | Admin | List or delete patients |
| GET | `/admin/appointments` | Admin | Monitor appointments (optional status filter) |

Doctor availability entries have `{ "dayOfWeek": 1, "startTime": "09:00", "endTime": "12:00" }`; `slotDurationMinutes` defaults to 30. A requested slot must fit completely within that interval and align to its start. Appointment dates are date-only UTC values, and booking at a past time is rejected.

## Verification

Run `npm test` for focused availability tests. `GET /health` is the container/application liveness endpoint.
