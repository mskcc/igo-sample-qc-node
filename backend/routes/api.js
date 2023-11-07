const express = require('express');
const qcReportRouter = require('./qcReport');
const pendingRouter = require('./pending');

// const { authenticate } = require('../util/jwt');
const app = express();

app.get('/qcReport/', qcReportRouter);
app.use('/pending/', pendingRouter);

module.exports = app;