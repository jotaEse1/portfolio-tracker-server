const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors');
const {connection} = require('./db')

//connect to db
connection.connect(err => {
    if(err) throw err
    console.log('Connected to db')
})

//port
const port = process.env.PORT || 8000

//middlewares
app.use(express.json({limit: '500mb'}))
app.use(cors({
    origin: 'http://localhost:3000'
}))

//routes
const portfolio = require('./routes/portfolio')

app.use('/api/v1/portfolio', portfolio)

app.get('/', (req, res) => {
    res.send('Hello!')
})

app.use('*', (req, res) => {
    res.send('<h1>Page not found</h1>')
})

app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`)
})