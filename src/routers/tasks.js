const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')

const router = express.Router()

// ?completed=true
// ?limit=10&skip=0
// ?sortBy=createdAt_asc || _desc
router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}
  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sortBy) {
    const [sortBy, sortByValue] = req.query.sortBy.split('_')
    sort[sortBy] = sortByValue === 'desc' ? -1 : 1
  }

  try {
    // const tasks = await Task.find({ owner: req.user._id })
    await req.user.populate({
      path: 'tasks',
      //filtrowanie tasków
      match, 
      // can be used for pagination or sorting
      options: { 
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        //asc : 1 / desc : -1
        sort,
      },
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send({ message: e.message })
  }

})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    // const task = await Task.findById(_id)
    const task = await Task.findOne({ _id, owner: req.user._id })


    if (!task) {
      res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send({ message: e.message })
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  const updates = req.body 
  const updatesKeys = Object.keys(req.body)
  const allowedUpdates = ['completed', 'description']
  const isValidOperation = updatesKeys.every(item => allowedUpdates.includes(item))
  if (!isValidOperation) {
    return res.status(404).send({ error: 'Wrong updates' })
  }
  try {
    const updatedTask = await Task.findOne({ _id, owner: req.user._id })
    // const updatedTask = await Task.findById(_id)
   
    if (!updatedTask) {
      return res.status(404).send()
    }

    updatesKeys.forEach(item => updatedTask[item] = updates[item])
    console.log(updatedTask)
    await updatedTask.save()
    // const updatedTask = await Task.findByIdAndUpdate(_id, updates, { new: true, runValidators: true })
    res.send(updatedTask)
  } catch (e) {
    res.status(400).send({ message: e.message })
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id })
    if (!task) {
      res.status(404).send()
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id })
  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

module.exports = router