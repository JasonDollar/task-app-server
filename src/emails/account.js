const sgMail = require('@sendgrid/mail')
const API = require('../config/api')

// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
sgMail.setApiKey(API)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'wheretogo667@gmail.com',
    subject: 'Thanks for joining in',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app`,
    html: `<h1>Welcome to the app, ${name}. Let me know how you get along with the app</h1>`,
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'wheretogo667@gmail.com',
    subject: 'Sorry to see yo go',
    text: `Sorry to see you go, ${name}. Let me know how you get along with the app`,
    html: `<h1>Sorry to see you go, ${name}. Let me know how you get along with the app</h1>`,
  })
}

const sendJobEmail = (emailFrom, text) => sgMail.send({
  to: 'elrey33@gmail.com',
  from: emailFrom,
  subject: 'PORTFOLIO',
  text,
})

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
  sendJobEmail,
}