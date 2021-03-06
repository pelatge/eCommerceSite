var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars'); // Express_Handelbars requirement
var mongoose = require('mongoose'); // Database requirement.
var session = require('express-session');
var passport = require('passport'); // password
var flash = require('connect-flash');
var validator = require('express-validator'); // require for signup validator checking
var MongoStore = require('connect-mongo')(session); // session store

var index = require('./routes/index'); // layout or main page route.
var userRoutes = require('./routes/user');

var app = express();

mongoose.connect('localhost:27017/DB_Bazar'); // Database connection
require('./config/passport');

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());  //signup validator checking // order is important, it should be after the bodyParser
app.use(cookieParser());
app.use(session({
    secret: 'mysupersecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 } // user max session.
}));
app.use(flash()); // for passport
app.use(passport.initialize()); // for passport
app.use(passport.session());   // for passport
app.use(express.static(path.join(__dirname, 'public')));

/* creating a Global variable named login, so that i can use it further. */
app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session; /* now i can have the access to use session variable in all my handlebars template without passing explicitly */
    next();
});

app.use('/user', userRoutes);
app.use('/', index); //ordering is important.

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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
