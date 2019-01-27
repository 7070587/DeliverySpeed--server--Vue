var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: '0000',   // 用來簽章 sessionID 的cookie，可以是一secret字串或是多個secret組成的一個陣列。如果是陣列，只有第一個元素會被簽到 sessionID cookie裡。而在驗證請求中的簽名時，才會考慮所有元素。
  cookie: {maxAge: 1000 * 60 * 60 * 24}, // 一天 // 控制 sessionID 的過期時間的，例如設置maxAge是80000ms，即80s後session和相應的cookie失效過期
  resave: false,    // 強制將session存回 session store, 即使它沒有被修改。預設是 true
  saveUninitialized: true   // 強制將未初始化的session存回 session store，未初始化的意思是它是新的而且未被修改。
}));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found.');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
