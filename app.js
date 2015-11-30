var express = require('express');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');

var knex = require('./database');

var routes = require('./routes/index');
var users = require('./routes/user');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';


// load cachebusted assets
var assets = {};
try {
    assets = JSON.parse(fs.readFileSync(path.join(__dirname, '/public/dist') + '/assets.json', 'utf8'));
} catch (e) {
    console.info('assets.json not found -- are you in DEV mode?');
}

var assetVirtualDir = 'static'; // map static files to domain.com/static/

app.locals.getCachebustedPath = function (path) {
    var isCachebusted = assets[path];
    var p = (isCachebusted) ? 'dist/' + isCachebusted : path;
    return assetVirtualDir + '/' + p;
};

var staticDir = path.join(__dirname + '/public');
app.use('/' + assetVirtualDir, express.static(staticDir, {
    maxAge: '30d'
}));

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'nunjucks');
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

app.use(require('express-promise')());

app.use('/', routes);
app.use('/users', users);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


module.exports = app;
