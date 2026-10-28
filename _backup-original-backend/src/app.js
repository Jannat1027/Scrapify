const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const listingsRoutes = require('./routes/listings.routes');
const claimsRoutes = require('./routes/claims.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: allowedOrigin.split(',').map((origin) => origin.trim()) }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Backend is running.' });
});
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/claims', claimsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
