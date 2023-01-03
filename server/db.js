const mysql = require('mysql');
const util = require('util');
require('dotenv').config()

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    ssl: false
})

connection.query = util.promisify(connection.query)

module.exports = {connection}