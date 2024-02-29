require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const http = require("http");
const socketIO = require('socket.io');
const socketIORoutes = require('./routes/socketIO.js');
const Redis = require("ioredis");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

try {
    mongoose.connect(process.env.DB_URI);
    console.log('Connected to the database!');
} catch (error) {
    console.error('MongoDB connection error:', error);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASS,
});

redisClient.on('error', (err) => {
    if (err.name === 'MaxRetriesPerRequestError') {
      return;
    }

    if (err.code === 'ECONNRESET') {
        console.log('Redis connection is reset!');
        return;
    }

    if (err.code === 'ETIMEDOUT') {
        console.log('Redis connection timed out!');
        return;
    }

    if (err.code === 'ENOTFOUND') {
        console.log("You're not connected!")
        return;
    }

    console.error('Redis connection failed:', err);
  });

app.use(session({
    store: new (require('express-session').MemoryStore)({
        client: redisClient,
    }),
    secret: process.env.SESSION_SECRET || "default_secret",
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 30 * 24
    }
}));

app.use((req, res, next) => {
    console.log(req.session.message);
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.set("view engine", 'ejs');

app.use("", require("./routes/routes.js"));
socketIORoutes(io);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server started at PORT: ${PORT}`);
});
