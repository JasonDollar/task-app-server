const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const cors = require('cors')
const auth = require('../middleware/auth')
const User = require('../models/user')
const { sendWelcomeEmail, sendCancelationEmail, sendJobEmail } = require('../emails/account')

const router = express.Router()



router.post('/users', async (req, res) => {
  const user = new User(req.body)
  
  try {
    await user.save()
    const token = await user.generateAuthToken()
    sendWelcomeEmail(user.email, user.name)
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post('/users/login', async (req, res) => {
  try {
    //customowa funkcja w User
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    // const publicProfile = user.getPublicProfile()
    res.send({ user, token })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(item => item.token !== req.token)
    await req.user.save()
 
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})


router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
 
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})



router.patch('/users/me', auth, async (req, res) => {
  // const _id = req.params.id
  const updates = req.body
  const updatesArr = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updatesArr.every(item => allowedUpdates.includes(item))
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' })
  }
  try {
    // const user = await User.findById(_id)

    updatesArr.forEach(item => {
      req.user[item] = updates[item]
    })
    await req.user.save()
    // const user = await User.findByIdAndUpdate(_id, updates, { new: true, runValidators: true })
    // new - zwraca nowego usera, a nie tego przed update

    res.status(200).send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})



router.delete('/users/me', auth, async (req, res) => {
  try {
    
    await req.user.remove()
    const isSent = await sendCancelationEmail(req.user.email, req.user.name)
    res.status(200).send({ ...req.user, isSent })
  } catch (e) {
    res.status(400).send(e)
  }
}) 

//-------------
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find()
    res.send(users)
  } catch (e) {
    res.status(500).send(e)
  }

})

router.get('/users/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const user = await User.findById(_id)
    if (!user) {
      return res.status(404).send()
    }
    res.send(user)
  } catch (e) {
    res.status(500).send(e)
  }
})

const upload = multer({
  limits: {
    fileSize: 1048576,
  },
  fileFilter(req, file, cb) {
    // cb(new Error('file must bd a PDF'))
    // cb(undefined, true)
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return cb(new Error('file must bd a Word doc'))
    }
    cb(null, true)

  },
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  try {

    await req.user.save()
    res.send()
  } catch (e) {
    res.status(400).send({ error: e.message })
  }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  // req.user.avatar = req.file.buffer
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    } 
      
    res.set('Content-Type', 'image/jpg')
    res.send(user.avatar)

  } catch (e) {
    res.status(404).send()
  }
})

router.post('/job-email', cors(), async (req, res) => {
  // console.log('start')
  const { emailFrom, text } = req.body
  const body = req.body
  // console.log('second')
  // res.status(200).send('lol')
  try {
    if (!emailFrom || !text) {
      res.status(400).send(body)
      
    }
    const isSent = await sendJobEmail(emailFrom, text)
    // res.header('Access-Control-Allow-Origin', '*')
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.status(200).send({ status: 'sent', isSent })
  } catch (e) {
    res.status(400).send({ error: 'Sth went wrong' })
  }
})


 
module.exports = router