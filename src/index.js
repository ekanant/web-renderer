const express = require('express');
const puppeteer = require('puppeteer');
const port = 3000
const CHROMIUM_BIN = process.env.CHROMIUM_BIN || ''
const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.json())

const printPDF = async ({url = "", format="A4", waitUntil = "load", html = ""}) => {    
    const browser = await puppeteer.launch({ 
        headless: true, 
        executablePath: CHROMIUM_BIN,
        args: [
            // Required for Docker version of Puppeteer
            '--no-sandbox',
            '--disable-setuid-sandbox',
            // This will write shared memory files into /tmp instead of /dev/shm,
            // because Docker’s default for /dev/shm is 64MB
            '--disable-dev-shm-usage',
            '--incognito',
        ]
    });
    const page = await browser.newPage();
    if(html) {
        await page.setContent(html)
    } else {
        await page.goto(url, {waitUntil});
    }
    await page.evaluateHandle('document.fonts.ready');
    const pdf = await page.pdf({ format, displayHeaderFooter: false, printBackground: true });
   
    await browser.close();
    return pdf
  }

app.get('/web-renderer/pdf', async (req, res) => {
    const { url = "", format="A4", waitUntil = "load", fileName = "pdf", download = "0" } = req.query;

    if(url) {
        try {
            const pdf = await printPDF({
                url, format, waitUntil
            })
            let responseHeader = {}
            responseHeader['Content-Type'] = "application/pdf"
            responseHeader['Content-Length'] = pdf.length

            if(download === "1") {
                responseHeader["Content-disposition"] = `attachment; filename=${fileName}.pdf`
            } else {
                responseHeader["Content-disposition"] = `inline; filename=${fileName}.pdf`
            }
            
            res.set(responseHeader)
            res.send(pdf)
        } catch (err) {
            console.error(`error url=${url}`, err)
            res.status(500).send("Error");
        }
        
    } else {
        res.status(400).send('bad request')
    }
})

app.post('/web-renderer/html-pdf', async (req, res) => {
    const { format="A4", waitUntil = "load", fileName = "pdf", download = "0" } = req.query;
    const html = req.body ? req.body["html"] : "";
    if(html ) {
        try {
            const pdf = await printPDF({
                html, format, waitUntil
            })
            let responseHeader = {}
            responseHeader['Content-Type'] = "application/pdf"
            responseHeader['Content-Length'] = pdf.length

            if(download === "1") {
                responseHeader["Content-disposition"] = `attachment; filename=${fileName}.pdf`
            } else {
                responseHeader["Content-disposition"] = `inline; filename=${fileName}.pdf`
            }
            
            res.set(responseHeader)
            res.send(pdf)
        } catch (err) {
            console.error(`error url=${url}`, err)
            res.status(500).send("Error");
        }
    } else {
        res.status(400).send('bad request')
    }
})

app.get('/web-renderer/healthz', async (req, res) => {
    res.json({
        "status": "ok"
    })
});

app.listen(port, () => {
    console.log(`Web renderer app listening at http://localhost:${port}`)
})