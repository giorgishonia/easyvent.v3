const express = require('express');
const bodyParser = require('body-parser');
const scrapeSchedule = require('./scraper');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('EasyVent Scraper API');
});

app.post('/scrape-schedule', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const scheduleData = await scrapeSchedule(username, password);
        res.json(scheduleData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
