// friendsMiddleware.js
const User = require('../models/User');
const {mongooseToObject} = require('../../util/mongoose');

module.exports = async function (req,res, next){
    try {
    const user = await User.findOne({ _id: req.session.userId });
    const nameUser = mongooseToObject(user);
    console.log('Ten nguoi dung',nameUser.name);
    res.locals.name = nameUser.name;
    next();
  } catch (error) {
    res.redirect('/');
  }
}   