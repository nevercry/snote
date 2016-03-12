var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);

var app = express();
var fs = require('fs');
// 数据库地址
var dbUrl = 'mongodb://localhost/snote'
var mongoose = require('mongoose');
mongoose.connect(dbUrl, function(err) {
  if (err) {
    console.log('connect error', err);
  } else {
    console.log('connect sucessful');
  }
});
// Models Loading
var models_path = __dirname + '/app/models'
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      } else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}

walk(models_path);


// view engine setup
app.set('views', path.join(__dirname, 'app/views/pages'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// session
app.use(session({
  secret: 'snote',
  resave: true,
  saveUninitialized: true,
  store: new mongoStore({
    url: dbUrl
  })
}))

require('./config/routes')(app);

app.locals.moment = require('moment');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.set('showStackError', true);
  app.use(logger(':method :url :status'));
  app.locals.pretty = true;
  mongoose.set('debug', true);

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;