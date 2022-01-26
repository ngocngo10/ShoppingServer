const express = require('express');
const route = express.Router();
const User = require('../models/user.model');
const middlewares = require('../middlewares/auth.middleware');
const bcrypt = require('bcryptjs/dist/bcrypt');
const { generateToken } = require('../utils/generateToken');

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

//Admin get All User *
route.get('/api/admin/users', [middlewares.verifyToken, middlewares.checkIsAdmin], async function (req, res, next) {
  const limit = Number(req.query.limit) || 0;
  const sort = req.query.sort == "desc" ? -1 : 1;
  try {
    ;
    var users = await User.find({}).select(['-password']).limit(limit);
    console.log('Admin get All User: ' + users);
    return res.json(users);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'Users not found' });
  }
})

//Admin get User by Id *
route.get('/api/admin/users/:id', [middlewares.verifyToken, middlewares.checkIsAdmin], async function (req, res, next) {
  try {
    var user = await User.findById(req.params.id).select(['-password']);
    console.log('Admin get User by Id ' + user);
    return res.json(user);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'Users not found' });
  }
})

//Admin edit User by Id *
route.put('/api/admin/users/:id', [middlewares.verifyToken, middlewares.checkIsAdmin], async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin;
    user.isLock = req.body.isLock;

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isLock: updatedUser.isLock,
    })
  } catch (error) {
    res.status(404).json({ message: 'User not found' });
  }

})

//Admin Delete User by Id *
route.delete('/api/admin/users/:id', [middlewares.verifyToken, middlewares.checkIsAdmin], async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    await user.remove();
    return res.json({
      message: 'User removed'
    })
  } catch (error) {
    return res.status(404).json({ message: 'User not found' });
  }

})
//getUserProfile *
route.get('/api/users/profile', [middlewares.verifyToken], async function (req, res, next) {
  try {
    const user = await User.findById(req.user._id).select(['-password', '-isLock']);
    console.log('getUserProfile ' + user);
    return res.json(user);
  } catch (error) {
    res.status(404).json({ message: 'User not found' });
  }
});

//updateUserProfile *
route.put('/api/users/profile', [middlewares.verifyToken], async function (req, res, next) {
  const salt = bcrypt.genSaltSync(10);
  try {
    const user = await User.findById(req.user._id).exec();
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = hashSync(req.body.password, salt);
      }
    }
    const updatedUser = await user.save();
    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = route;