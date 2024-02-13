require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const http = require("http");
const socketIO = require('socket.io');
const socketIORoutes = require('./routes/socketIO.js');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connect to the database!'))

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
    })
);

app.use((req, res, next) => {
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