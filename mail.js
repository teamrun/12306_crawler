'use strict';

const nodemailer = require('nodemailer');

// !!sender info
var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

/* opt like this:
var mailOptions = {
    from: '"Fred Foo 👥" <foo@bar.com>', // sender address
    to: 'chenllos@163.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>' // html body
};
*/

module.exports = (opt, callback) => {
  return transporter.sendMail(opt, callback);
}
