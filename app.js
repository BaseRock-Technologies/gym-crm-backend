require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongo = require('./mongo');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const billRouter = require('./routes/bills');
const defaultRouter = require('./routes/default');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// const corsOptions = {
//   origin: 'http://localhost:8000', // Use array to add new url
//   optionsSuccessStatus: 200
// }
// app.use(cors(corsOptions))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(cors());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/bills', billRouter);
app.use('/default', defaultRouter);

const createError = (status) => {
    const err = new Error('Not Found');
    err.status = status;
    return '404 Not Found';
};

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

mongo.connection.on('connected', () => {
    console.log('Connected successfully to the database');
});

mongo.connection.on('error', () => {
    console.log('Failed to connect to the db');
});

module.exports = app;
