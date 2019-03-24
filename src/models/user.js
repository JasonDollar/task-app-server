const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true,
    trim: true,
    // lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(val) {
      if (val.length <= 6) {
        throw new Error('to short') 
      } else if (val.includes('password')) {
        throw new Error('lol')
      }
    },
  },
  email: {
    type: String,
    unique: true, //unikalna wartosc w calej db
    required: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error('Email is invalid')
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number')
      }
    },
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
  avatar: {
    type: Buffer,
  },
}, {
  timestamps: true,
})

//hash plain text passworx
userSchema.pre('save', async function (next) {
  //this === document being saved

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8)
  }
  next()
})

//delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  await Task.deleteMany({ owner: this._id })

  next()
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id', // gdzie lokalne dane sa przetrzymywane
  foreignField: 'owner', // nazwa atrybutu w innym modelu
  // czyli owner w modelu Task odpowiada _id w modelu User
}) //virtual attributes - sets relationship between data

// methods - on an instance, statics - on a model
userSchema.methods.toJSON = function () { // .toJSON - manipuluje danymi tuz przed przerobieniem ich do JSON
  const user = this
  const userObject = user.toObject() // gives raw profile data

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar
  // console.log(userObject)

  return userObject
}

userSchema.methods.generateAuthToken = async function () {
  const user = this
  // const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET)
  const token = jwt.sign({ _id: user.id.toString() }, 'thisissecret')

  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

//
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new Error('Unable to log in')
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Unable to log in')
  }
  return user
}

const User = mongoose.model('User', userSchema)
 
module.exports = User