const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');
const postingRoutes = require('./routes/postingRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const skillRoutes = require('./routes/skillRoutes');
const evaluateRoutes = require('./routes/evaluateRoutes');
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors()); 
app.use(express.json()); 

app.use('/api/postings', postingRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/evaluate', evaluateRoutes);

app.get('/', (req, res) => {
    res.send('Job Portal API is running...');
});

app.listen(PORT, () => {
    console.log(`Server chạy tại: http://localhost:${PORT}`);
});