var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var ejs = require('ejs');


var indexRouter = require('./routes/index');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/public');

app.engine('.ejs', ejs.__express);

app.use('/', indexRouter);

app.use(function (req, res, next) {
    res.status(404).send('Üzgünüm, dosyayı bulamadım!')
});

app.use(cookieParser());

module.exports = app;
