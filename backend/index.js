require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const apiRouter = require('./routes/api');

const port = process.env.PORT || 3001;
const hostname = '127.0.0.1';
const publicDir = path.join(__dirname, 'public');

const app = express();


mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('[MongoDB] Connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Connection error:', err);
});


app.use(express.json());
app.use(cookieParser());

const jwtInCookie = require('jwt-in-cookie');
jwtInCookie.configure({ secret: process.env.JWT_SECRET_KEY });

app.use(cors({
  origin: true,
  credentials: true,
}));


app.use(express.static(path.resolve(__dirname, '../frontend/build')));

app.use('/api/', apiRouter);


app.use('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const db = require('./models');
db.sequelize.sync();


const server = http.createServer(app);
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

module.exports = server;
