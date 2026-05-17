const express = require('express');
const cors = require('cors');
require('dotenv').config();

const kpiRoutes = require('./routes/kpis');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

app.use('/api/kpis', kpiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SME Retail BI Dashboard API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
