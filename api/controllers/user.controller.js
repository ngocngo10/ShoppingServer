const express = require('express');
const route = express.Router();
const User = require('../models/user.model');
const middlewares = require('../middlewares/auth.middleware');
const bcrypt = require('bcryptjs/dist/bcrypt');


//Quản lí tài khoản người dùng(Khóa, mở khóa)
route.patch('/api/admin/users/:id', [middlewares.checkIsAdmin], async function (req, res, next) {
  if (typeof req.body == 'undefined' || req.params.id === null) {
    return res.json({
      status: "Error",
      message: "Something went wrong! check your sent data"
    });
  }

  try {
    var result = await User.updateOne({
      _id: req.params.id
    },
      {
        isLock: req.body.isLock
      },
    )
    console.log('User have been locked' + result);
    if (req.body.isAdmin) {
      return res.json({ message: "User have been locked" });
    }
    return res.json({ message: "User have been unlocked" });
  } catch (error) {
    console.log(error);
    next(error);
  }
})

//Admin get All User
route.get('/api/admin/users', [middlewares.checkIsAdmin], async function (req, res, next) {
  const limit = Number(req.query.limit) || 0;
  const sort = req.query.sort == "desc" ? -1 : 1;
  try {
    var users = await User.find({ isAdmin: false }).select(['-password', '-isAdmin']).limit(limit).sort({ name: sort });
    console.log('Admin get All User: ' + users);
    return res.json(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
})

//Admin get User by Id
route.get('/api/admin/users/:id', [middlewares.checkIsAdmin], async function (req, res, next) {
  try {
    var user = await User.find({ _id: req.params.id }).select(['-password', '-isAdmin']);
    console.log('Admin get User by Id ' + user);
    return res.json(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
})
//getUserProfile
route.get('/api/user/profile', [middlewares.verifyToken], async function (req, res, next) {
  try {
    const user = await User.find({ _id: req.userId }).select(['-password', '-isAdmin', '-isLock']);
    console.log('getUserProfile ' + user);
    return res.json(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//updateUserProfile
route.patch('/api/user/profile', [middlewares.verifyToken], async function (req, res, next) {
  const salt = bcrypt.genSaltSync(10);
  try {
    const user = await User.findOne({ _id: req.userId }).exec();
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if(req.body.password) {
        user.password = hashSync(req.body.password, salt);
      }
    }
    const updatedUser = await user.save();
    return res.json({"message": "updatedUser"});
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = route;