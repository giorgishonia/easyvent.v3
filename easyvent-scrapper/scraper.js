const puppeteer = require('puppeteer');

async function scrapeSchedule(username, password) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('https://classroom.btu.edu.ge/ge/student/me/schedule');

    // Log in to the university website
    await page.type('#username', username);
    await page.type('#password', password);
    await page.click('#login-button');
    await page.waitForNavigation();

    // Scrape schedule data after login
    const scheduleData = await page.evaluate(() => {
        const rows = document.querySelectorAll('.schedule-row'); // Adjust the selector based on actual HTML structure
        return Array.from(rows).map(row => ({
            date: row.querySelector('.date').innerText,
            time: row.querySelector('.time').innerText,
            course: row.querySelector('.course').innerText,
            room: row.querySelector('.room').innerText,
        }));
    });

    await browser.close();
    return scheduleData;
}

module.exports = scrapeSchedule;
