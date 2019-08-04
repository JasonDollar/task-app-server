require('dotenv').config({ path: './src/config/.env' })
const express = require('express')
const bodyParser = require('body-parser')

require('./db/mongoose')


const userRouter = require('./routers/users')
const tasksRouter = require('./routers/tasks')

const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(userRouter)
app.use(tasksRouter)

module.exports = app