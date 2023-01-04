const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {connection} = require('./server/db')

//connect to dba
connection.connect(err => {
    console.log(err)
    if(err) throw err
    console.log('Connected to db')
})

//middlewares
app.use(cors({
    origin: 'https://jotaese1.github.io',
    credentials: true
}))
app.use(cookieParser())
app.use(express.json({limit: '500mb'}))

//port
const port = process.env.PORT || 8000

//routes
const portfolio = require('./server/routes/portfolio'),
    authentication = require('./server/routes/authentication')

app.use('/api/v1/portfolio', portfolio)
app.use('/api/v1/authentication', authentication)

app.get('/', (req, res) => {
    res.send('Hello!')
})

app.use('*', (req, res) => {
    res.send('<h1>Page not found</h1>')
})

app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`)
})

const allowCors = fn => async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    // another common pattern
    // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }
    return await fn(req, res)
  }
  
  const handler = (req, res) => {
    const d = new Date()
    res.end(d.toString())
  }
  
  module.exports = allowCors(handler)
