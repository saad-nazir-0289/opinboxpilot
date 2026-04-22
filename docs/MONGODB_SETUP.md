# MongoDB Setup

## 1. Create a cluster

- Create a MongoDB Atlas project
- Create a cluster or use an existing one
- Create a database user with read/write access

## 2. Allow network access

- Open `Network Access`
- Add your local IP, or temporarily allow `0.0.0.0/0` for testing only

## 3. Get the connection string

- Open `Connect -> Drivers`
- Copy the connection string
- Replace the username, password, and database values as needed

## 4. Add it to `.env`

```env
MONGODB_URI=your_mongodb_connection_string
```

## 5. Verify the connection

- Start the backend with `node server.js`
- Check for the `Connected to MongoDB` message
- Open `http://localhost:5000/api/health` and inspect `mongoConnectionState`
