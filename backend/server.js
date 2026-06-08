const express = require('express');
const cors = require('cors');
require('dotenv').config();

const kpiRoutes = require('./routes/kpis');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dataRoutes = require('./routes/data');
const suggestionRoutes = require('./routes/suggestions');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes — require login
app.use('/api/kpis', authenticate, kpiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/data', authenticate, dataRoutes);
app.use('/api/suggestions', suggestionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SME Retail BI Dashboard API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
