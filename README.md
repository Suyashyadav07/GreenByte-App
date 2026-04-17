# GreenByte App

GreenByte is an e-waste collection and rewards platform with three user roles:

- `customer` can register, request pickups, track impact, and redeem rewards.
- `recycler` can view open requests, accept jobs, and move pickups through collection stages.
- `admin` can monitor overall users, requests, recyclers, and dashboard totals.

This repo contains both the Expo app and the Node.js + MongoDB backend used by the dashboards, rewards, pickups, and Firebase phone authentication flow.

## What is in this repo

```text
GreenByte-App
├── App.js                  # Expo app with customer, recycler, and admin flows
├── package.json            # Frontend scripts
└── backend
    ├── src
    │   ├── config          # env + Mongo connection
    │   ├── controllers     # request/response handlers
    │   ├── models          # MongoDB schemas
    │   ├── routes          # API routes under /api/v1
    │   ├── services        # business logic
    │   └── validators      # zod validation
    ├── scripts             # seed and analytics pipeline
    └── package.json        # Backend scripts
```

## Tech stack

- Frontend: Expo, React Native, React Navigation
- Backend: Node.js, Express, Mongoose, Zod
- Database: MongoDB
- Local runtime: Docker for MongoDB, optional

## Main product flows

### Customer flow

1. Register with name, role, and phone number.
2. Log in with phone number.
3. Request a Firebase OTP.
4. Verify the OTP through Firebase.
5. Browse the catalog and estimate scrap value.
6. Create a pickup request.
7. Track pickup status, impact, and rewards.

### Recycler flow

1. Log in with recycler role.
2. View open requests in the queue.
3. Accept or reject a request.
4. Update request progress as collection moves forward.

### Admin flow

1. Log in with admin role.
2. View user counts, request counts, recycler data, and transaction totals.
3. Inspect dashboard and recycler management endpoints.

## Quick start

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Start MongoDB

If Docker is available:

```bash
cd backend
docker compose up -d
```

### 4. Configure backend environment

The backend already expects:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/greenbyte
AUTO_SEED=false
```

### 5. Seed catalog and rewards

From the repo root:

```bash
npm run backend:seed
```

### 6. Start the backend

From the repo root:

```bash
npm run backend:dev
```

### 7. Start the Expo app

For web:

```bash
npm run web
```

For mobile:

```bash
npm run mobile
```

For Android over USB:

```bash
npm run mobile:usb
```

## Firebase phone auth

The app now sends **real OTP SMS messages with Firebase Authentication**.

Current login flow:

1. The app checks that the selected `customer`, `recycler`, or `admin` account exists in the backend with `POST /api/v1/auth/login`.
2. The app starts Firebase phone verification from [firebaseConfig.js](/home/harshbamane/Documents/my_greenbyte/GreenByte-App/firebaseConfig.js:1).
3. Firebase reCAPTCHA runs through `expo-firebase-recaptcha`.
4. Firebase sends the OTP SMS to the phone number.
5. After the user enters the code, Firebase verifies the OTP.
6. The app then loads the matching backend user profile and opens the dashboard.

### Required Firebase console setup

In Firebase Console:

1. Go to `Authentication` -> `Sign-in method`.
2. Enable `Phone` as a provider.
3. For web testing, make sure your domain is in `Authorized domains`.
4. If you are only testing, add Firebase test phone numbers to avoid quota issues.

### Important local setup note

The backend is still required because roles, profiles, pickups, rewards, and dashboards come from MongoDB.

If OTP still does not arrive, check these first:

- The account must already exist for the selected role in MongoDB.
- `Phone` auth must be enabled in Firebase Authentication.
- The Firebase project must not have exhausted SMS quota.
- The backend must be running on port `4000`.
- On a physical phone, `localhost` in `App.js` will not point to your computer.

For a real device, replace:

```js
const API_BASE_URL = 'http://localhost:4000/api/v1';
```

with your computer's LAN IP, for example:

```js
const API_BASE_URL = 'http://192.168.1.20:4000/api/v1';
```

### Legacy backend OTP endpoints

The backend still contains:

- `POST /auth/request-otp`
- `POST /auth/verify-otp`

Those endpoints are now legacy demo endpoints and are no longer used by the app login screen.

## API overview

Base URL:

```text
http://localhost:4000/api/v1
```

Main routes:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/request-otp`
- `POST /auth/verify-otp`
- `GET /catalog`
- `POST /pickups/estimate`
- `POST /pickups`
- `GET /pickups?userId=<userId>`
- `PATCH /pickups/:pickupId/status`
- `GET /rewards`
- `POST /rewards/redeem`
- `GET /dashboard/:userId`
- `GET /admin/overview`
- `GET /admin/requests`
- `GET /admin/recyclers`

## MongoDB collections

The main collections created by this app are:

- `users`
- `pickups`
- `catalogitems`
- `recyclerprofiles`
- `rewards`
- `rewardredemptions`
- `analyticssnapshots`

## How dashboard data flows through MongoDB

### User dashboard flow

1. A customer creates a pickup.
2. The backend writes the pickup into `pickups`.
3. Pickup totals such as `totalEstimate`, `totalWeightKg`, and `impact` are stored on that document.
4. When pickup status becomes `completed` or `paid`, the backend credits coins to the user.
5. `GET /dashboard/:userId` reads:
   - the user from `users`
   - that user's pickup totals from `pickups`
   - recent redemptions from `rewardredemptions`
   - the latest system snapshot from `analyticssnapshots`
6. The API returns both `user` and `system` dashboard sections together.

### System dashboard flow

1. Pickup and reward data accumulate in MongoDB.
2. `backend/scripts/runAnalyticsPipeline.js` runs the aggregation pipeline.
3. `buildSystemSnapshot()` in `backend/src/services/analyticsService.js` calculates:
   - total users
   - total pickups
   - completed pickups
   - total estimated value
   - total weight
   - total CO2 saved
   - total trees saved
   - total raw material recovered
   - total coins redeemed
   - top pickup categories
4. The snapshot is stored in `analyticssnapshots`.
5. The dashboard endpoint reads the latest snapshot and serves it to the app.

## Useful MongoDB checks

Open the database:

```bash
mongosh greenbyte
```

See collections:

```javascript
db.getCollectionNames()
```

See registered users:

```javascript
db.users.find({}, { name: 1, phone: 1, role: 1, coinsBalance: 1, authOtp: 1 })
```

See recent pickups:

```javascript
db.pickups
  .find({}, { user: 1, status: 1, totalEstimate: 1, totalWeightKg: 1, impact: 1, createdAt: 1 })
  .sort({ createdAt: -1 })
```

See reward redemptions:

```javascript
db.rewardredemptions.find().sort({ createdAt: -1 })
```

See latest analytics snapshot:

```javascript
db.analyticssnapshots.find().sort({ snapshotDate: -1 }).limit(1)
```

Rebuild dashboard aggregates after new data:

```bash
npm run backend:pipeline
```

## Developer notes

- Backend validation uses Zod.
- Business logic lives mainly in `backend/src/services`.
- Pickup impact calculations are in `backend/src/utils/calculatePickupMetrics.js`.
- Legacy demo OTP logic still exists in `backend/src/services/authService.js`.
- The dashboard endpoint is in `backend/src/controllers/dashboardController.js`.
- Snapshot generation is in `backend/src/services/analyticsService.js`.

## Current limitations

- Firebase config still lives in a local JS file instead of environment variables.
- `App.js` still uses a single hardcoded API base URL.
- There are no automated tests yet.
- Frontend and backend configuration are not yet environment-driven.

## Recommended next improvements

1. Move frontend API and Firebase settings into environment variables.
2. Verify Firebase ID tokens on the backend with `firebase-admin` for stronger auth.
3. Add tests for auth, pickups, and dashboard aggregation.
4. Add role-based protection for admin and recycler endpoints.
5. Add Swagger or Postman documentation for the backend.
