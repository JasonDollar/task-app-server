const express = require('express')
const bodyParser = require('body-parser')

require('./db/mongoose')

// require('dotenv').config()

// console.log(process.env)


const userRouter = require('./routers/users')
const tasksRouter = require('./routers/tasks')
// const authMiddleware = require('./middleware/auth')



const app = express()



app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(userRouter)
app.use(tasksRouter)
const port = process.env.PORT || 3000



app.listen(port, () => {
  console.log('started', port) 
})

// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')

// const myFunc = async () => {
//   const token = jwt.sign({ _id: 'qweasddfg' }, 'thisismynewcourse', { expiresIn: '1s' })
//   console.log(token)

//   const lol = jwt.verify(token, 'thisismynewcourse')
//   console.log(lol)
// }
// myFunc()

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//   // const task = await Task.findById('5c9146fd1052fd04acb91d9c')
//   // await task.populate('owner').execPopulate() // populates data from the relationship (ref)
//   // console.log(task)

//   const user = await User.findById('5c91462b72825105b859fff8')
//   await user.populate('tasks').execPopulate()
//   // console.log(user.tasks)
// }

// main()

/*
/Users/elrey/mongodb/bin/mongod.exe --dbpath=/Users/elrey/mongodb-data
*/