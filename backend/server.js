const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');
const postingRoutes = require('./routes/postingRoutes');
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors()); 
app.use(express.json()); 

app.use('/api/postings', postingRoutes);

app.get('/', (req, res) => {
    res.send('Job Portal API is running...');
});

app.listen(PORT, () => {
    console.log(`Server chạy tại: http://localhost:${PORT}`);
});