const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {
  userOne, userTwo, userOneId, setupDatabase, 
} = require('./fixtures/db')

beforeEach(setupDatabase)


describe('authentication', () => {
  test('should signup a new user', async () => {
    const response = await request(app).post('/users').send({
      name: 'Jason',
      email: 'qwe@qwe.qwe',
      password: 'qweqweqwe',
    }).expect(201)
    // assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
  
    // assertions about the response
    expect(response.body).toMatchObject({
      user: {
        name: userOne.name,
      },
      token: user.tokens[0].token,
    })
    expect(user.password).not.toBe(userOne.password)
  })
  
  test('should login user', async () => {
    const response = await request(app).post('/users/login').send({
      email: userOne.email,
      password: userOne.password,
    }).expect(200)
  
    const user = await User.findById(response.body.user._id)
    // 1st token comes after creating user, second token is the one created by logging in
    expect(response.body.token).toBe(user.tokens[1].token)
  })
  
  test('should not login not existing user', async () => {
    await request(app)
      .post('/users/login')
      .send({
        email: 'random@random.email',
        password: 'someRandomPassword',
      })
      .expect(400)
  })

  test('Should not signup user with invalid name/email/password', async () => {
    await request(app)
      .post('/users')
      .send({
        name: '',
        email: 'john@example.com',
        password: 'abc1234',
      })
      .expect(400)
    const responseDupEmail = await request(app)
      .post('/users')
      .send({
        name: 'john smith',
        email: userOne.email,
        password: 'abc1234',
      })
      .expect(400)
    expect(responseDupEmail.body.code).toEqual(11000)
    
  })
})


describe('fetch user', () => {

  test('should get profile for user', async () => {
    await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
  })
  
  test('should not get profile for unauthenticated user', async () => {
    await request(app)
      .get('/users/me') 
      .send()
      .expect(401)
  })
})


describe('update user', () => {

  test('should upload avatar image', async () => {
    await request(app)
      .post('/users/me/avatar')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .attach('avatar', 'tests/fixtures/profile-pic.jpg')
      .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
  })

  test('should remove user avatar', async () => {
    const res = await request(app)
      .delete('/users/me/avatar')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
    const user = await User.findById(userOne._id)
    expect(user.avatar).toBeUndefined()
  })
  
  
  test('should update valid user fields', async () => {
    const updates = {
      name: 'Jason Updated',
    }
    await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(updates)
      .expect(200)
  
    const user = await User.findById(userOneId)
    expect(user.name).toBe(updates.name)
  })
  
  test('should not update invalid user fields', async () => {
    const updates = {
      location: 'Poland, Warsaw',
    }
    await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(updates)
      .expect(400)  
  })

  
  test('Should not update user if unauthenticated', async () => {
    const response = await request(app)
      .patch('/users/me')
      .send({
        email: 'john@example.com',
      })
      .expect(401)
    expect(response.body.error).toEqual('Please authenticate')
  })

  test('Should not update user with invalid name/email/password', async () => {
    await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        name: '',
      })
      .expect(400)
    const responseDupEmail = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        email: userTwo.email,
      })
      .expect(400)
    expect(responseDupEmail.body.code).toEqual(11000)
  })
})


describe('delete user', () => {

  test('should delete account for user', async () => {
    await request(app)
      .delete('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
      
    const userExists = await User.findById(userOneId)
  
    expect(userExists).toBeNull()
  })
  
  test('should not delete account if unauthenticated user', async () => {
    await request(app)
      .delete('/users/me')
      .send()
      .expect(401)
  })
})
