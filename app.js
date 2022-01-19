var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');
const authRouter = require('./api/controllers/auth.controller');
const productRouter = require('./api/controllers/product.controller');
const cartRouter = require('./api/controllers/cart.controller');
const userRouter = require('./api/controllers/user.controller');

var indexRouter = require('./api/controllers/index');
var usersRouter = require('./api/controllers/users');

var app = express();
var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose.connect('mongodb://admin123:admin123@localhost:27017/shopping_db');
var db = mongoose.connection;
//Bắt sự kiện error
db.on('error', function (err) {
  if (err) console.log(err)
});
//Bắt sự kiện open
db.once('open', function () {
  console.log("Kết nối thành công !");
});

app.use(cors(corsOptions));
app.use('/', indexRouter);
app.use('/', usersRouter);

app.get('/health_check', (req, res) => {
  res.send('ok');
})
app.use('/', authRouter);
app.use('/', productRouter);
app.use('/', cartRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err)

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
