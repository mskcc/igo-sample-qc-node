const express = require('express');
const qcReportRouter = require('./qcReport');
const pendingRouter = require('./pending');
const { authenticate } = require('../util/jwt');

const app = express();

app.use('/qcReport/', authenticate, qcReportRouter);
app.use('/pending/', authenticate, pendingRouter);

module.exports = app;