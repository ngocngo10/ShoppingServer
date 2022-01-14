const User = require('../models/user');
var jwt = require('jsonwebtoken');

async function checkUserExist(req, res, next) {
  try {
    let result = await User.findOne({ userName: req.body.userName }).exec();
    if (result) {
      return res.status(400).json({ message: "UserName already existed!!!" });
    }

    result = await User.findOne({ email: req.body.email }).exec();
    if (result) {
      return res.status(400).json({ message: "Email already existed!!!" });
    }
    result = await User.findOne({ phoneNumber: req.body.phoneNumber }).exec();
    if (result) {
      return res.status(400).json({ message: "PhoneNumber already existed!!!" });
    }
    next();

  } catch (error) {
    next(error);
  }

}

async function checkToken(req, res, next) {
  var token = req.headers.authorization;
  //token ko co
  if (!token) {
    return res.status(403).json({ message: "Permission denied!!" });
  }
  //token bi sai or het han
  try {
    //so sanh token gui len 
    var decoded = jwt.verify(token.replace('Bearer ', ''), 'shhhhh');
    console.log(decoded);
  } catch (err) {
    console.log(err);
    return res.status(403).json({ message: "Permission denied!!" });
  }
  next();
}
module.exports = { checkUserExist, checkToken };
