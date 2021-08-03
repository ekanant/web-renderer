const express = require('express');
const puppeteer = require('puppeteer');
const app = express()
const port = 3000

app.get('/web-renderer/pdf', async (req, res) => {
    const { url = "", format="A4" } = req.query;

    if(url) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, {waitUntil: 'networkidle0'});
        const pdf = await page.pdf({ format, displayHeaderFooter: false, printBackground: true });

        console.log("pdf", pdf);
    
        await browser.close();
        res.send(pdf)
    } else {
        res.send('Hello World!url='+url)
    }
})

app.listen(port, () => {
    console.log(`Web renderer app listening at http://localhost:${port}`)
})