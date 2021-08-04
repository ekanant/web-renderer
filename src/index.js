const express = require('express');
const puppeteer = require('puppeteer');
const app = express()
const port = 3000

const printPDF = async ({url = "", format="A4", waitUntil = "load"}) => {
    const browser = await puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage']});   //--disable-dev-shm-usage for run on docker
    const page = await browser.newPage();
    await page.goto(url, {waitUntil});
    const pdf = await page.pdf({ format, displayHeaderFooter: false, printBackground: true });
   
    await browser.close();
    return pdf
  }

app.get('/web-renderer/pdf', async (req, res) => {
    const { url = "", format="A4", waitUntil = "load" } = req.query;

    if(url) {
        try {
            const pdf = await printPDF({
                url, format, waitUntil
            })
            res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
            res.send(pdf)
        } catch (err) {
            console.error(`error url=${url}`, err)
            res.send("Error");
        }
        
    } else {
        res.send('Hello World!url='+url)
    }
})

app.listen(port, () => {
    console.log(`Web renderer app listening at http://localhost:${port}`)
})