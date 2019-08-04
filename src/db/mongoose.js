const mongoose = require('mongoose')

mongoose.connect(process.env.NODE_ENV === 'test' ? process.env.MONGODB_URL_TESTING : process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(data => console.log('db connected'))
  .catch(err => console.log(err))

