const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
  userOne, userTwo, userOneId, setupDatabase, taskOne, 
} = require('./fixtures/db')

beforeEach(setupDatabase)


describe('fetch tasks', () => {

  test('should fetch all tasks for user one', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
    
    expect(response.body.length).toBe(2)
  })

  test('should fetch task by id', async () => {
    const response = await request(app)
      .get(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
    
    expect(response.body._id).toBe(taskOne._id.toString())
    expect(response.body.description).toBe(taskOne.description)
  })
  
  test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
      .get(`/tasks/${taskOne._id}`)
      .send()
      .expect(401)
  })

  test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
      .get('/tasks?completed=false')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
    expect(response.body.every(task => task.completed === false)).toEqual(true)
  })
})


describe('create tasks', () => {

  test('should create task for user', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        description: 'From my test',
      })
      .expect(201)
    
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
    expect(task.owner).toEqual(userOneId)
  })
  
  test('Should not create task with invalid description/completed', async () => {
    const responseOne = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        description: '',
      })
      .expect(400)
    const responseTwo = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        description: 'should not create',
        completed: 'it is wrong',
      })
      .expect(400)
    
    expect(responseOne.errors).not.toBeNull()
    expect(responseTwo.errors).not.toBeNull()
  })
})


describe('update tasks', () => {

  test('should update task', async () => {
    const updates = {
      description: 'updated',
      completed: true,
    }
    const response = await request(app)
      .patch(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(updates)
      .expect(200)
    const task = await Task.findById(response.body._id)

    expect(task.description).toBe(updates.description)
    expect(task.completed).toBe(updates.completed)
  })
  
  test('should not update task with invalid description/completed', async () => {
    const responseOne = await request(app)
      .patch(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        description: '',
      })
      .expect(400)
    const responseTwo = await request(app)
      .patch(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        completed: 'it is wrong',
      })
      .expect(400)
    expect(responseOne.errors).not.toBeNull()
    expect(responseTwo.errors).not.toBeNull()
  })

  test('should not update task belonging to other user', async () => {
    const updates = {
      description: 'updated by userTwo',
    }
    await request(app)
      .patch(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .send(updates)
      .expect(404)
  
    const task = await Task.findById(taskOne._id)
    expect(task.description).not.toBe(updates.description)
  })

})


describe('delete tasks', () => {

  test('should delete user task', async () => {
    await request(app)
      .delete(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
  
    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
  })
  
  test('should not delete task if unauthenticated', async () => {
    await request(app)
      .delete(`/tasks/${taskOne._id}`)
      .send()
      .expect(401)
  
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
  })
  
  test('should not delete task belonging to other user', async () => {
    await request(app)
      .delete(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .send()
      .expect(404)
    
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
  })
  
})
