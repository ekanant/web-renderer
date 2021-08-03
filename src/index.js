const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    const { url = "" } = req.query;
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Web renderer app listening at http://localhost:${port}`)
})