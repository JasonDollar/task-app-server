const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
  _id: userOneId,
  name: 'Jason',
  email: 'test@qwe.qwe',
  password: 'qweqweqwe',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
  }],
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
  _id: userTwoId,
  name: 'Jason 2',
  email: 'example2@qwe.qwe',
  password: 'qweqwe222',
  tokens: [{
    token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
  }],
}

// const taskOneId = new mongoose.Types.ObjectId()
const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'First task',
  completed: false,
  owner: userOneId,
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Second task',
  completed: true,
  owner: userOneId,
}

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Third task',
  completed: true,
  owner: userTwoId,
}

const setupDatabase = async () => {
  await User.deleteMany()
  await Task.deleteMany()
  await User.create(userOne)
  await User.create(userTwo)
  await Task.create(taskOne)
  await Task.create(taskTwo)
  await Task.create(taskThree)
}

module.exports = {
  userOne,
  userTwo,
  userTwoId,
  userOneId,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
}