# Personalised News App

## Setup

1) Server env (`server/.env`):

```
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/?retryWrites=true&w=majority
SESSION_SECRET=please_change_me
CORS_ORIGIN=http://localhost:5173
NEWS_API_KEYS=key1,key2
```

2) Install deps:

```
cd server && npm install
cd ../client && npm install
```

3) Run dev servers (two terminals):

```
cd server && npm run dev
cd client && npm run dev
```

## Features
- Email/password auth with sessions
- Personalised feed using user interests
- Search by keywords/categories
- Save/remove articles

## Notes
- Provide a valid News API key set in `NEWS_API_KEYS` to see live articles.

