require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const apiRouter = require('./routes/api');

const port = process.env.PORT || 3001;
const hostname = '127.0.0.1';

var publicDir = path.join(__dirname, 'public');

const mysqllib = require('./services/mySqlConnect');

const app = express();

app.use(cookieParser());
const jwtInCookie = require('jwt-in-cookie');
jwtInCookie.configure({ secret: process.env.JWT_SECRET_KEY });

const corsConfig = {
    origin: true,
    credentials: true,
};

// To allow cross-origin requests
app.use(cors(corsConfig));

// Have Node serve the files for our built frontend app
app.use(express.static(path.resolve(__dirname, '../frontend/build')));

// Handle GET requests to /api route
// app.get("/api", (req, res) => {
//     res.json({ message: "Hello from server!" });
// });
app.use('/api/', apiRouter);

// All other GET requests not handled before will return our React app
app.use('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

mysqllib.connect().then(() => {
    console.log('Connected to mysql...');
    // var routes = require('./api/routes/routes'); //importing route
    // routes(app);
    // console.log('todo list RESTful API server started on: ' + port);
    // app.listen(port);
  
}).catch(e => {
    console.error('Error connecting mysql...', e);
    process.exit();
});

const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

module.exports = server;
