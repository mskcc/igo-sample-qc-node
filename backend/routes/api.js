// routes/api.js
const express = require('express');
const qcReportRouter = require('./qcReport');
const pendingRouter = require('./pending');
const userSyncMiddleware = require('../middleware/userSyncMiddleware.js');

const app = express();

app.use(userSyncMiddleware);
app.use('/qcReport/', qcReportRouter);
app.use('/pending/', pendingRouter);

module.exports = app;
