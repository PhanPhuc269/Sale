require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const sortMidleware= require('./app/middlewares/sortMiddleware');

const session = require('express-session');



//nodemon --inspect src/index.js
const db = require('./config/db');
db.connect();

const app = express();
const port = process.env.PORT || 3000;

const route = require('./routes');  


app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        //secure: true, // Chỉ dùng với HTTPS
        sameSite: 'strict', // Bảo vệ chống CSRF
        maxAge: 3600000 // Thời gian sống của session cookie
    }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json())
app.use(methodOverride('_method'));
app.use(morgan('combined'));
app.use(sortMidleware);
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  next();
});



// Template engine
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: require('./helpers/handlebars')
}));
app.set('view engine', 'hbs');

app.set('views', path.join(__dirname, 'resources/views'));

route(app);

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});