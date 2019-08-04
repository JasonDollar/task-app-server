const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const userOne = {
  name: 'Jason',
  email: 'test@qwe.qwe',
  password: 'qweqweqwe',
}

beforeEach(async () => {
  await User.deleteMany()
  await User.create(userOne)
})

test('should signup a new user', async () => {
  await request(app).post('/users').send({
    name: 'Jason',
    email: 'qwe@qwe.qwe',
    password: 'qweqweqwe',
  }).expect(201)
})

test('should login user', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password,
  }).expect(200)
})

test('should not login not existing user', async () => {
  await request(app).post('/users/login').send({
    email: 'random@random.email',
    password: 'someRandomPassword',
  }).expect(400)
})