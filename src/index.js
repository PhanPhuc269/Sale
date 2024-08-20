require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const sortMidleware= require('./app/middlewares/sortMiddleware');



//nodemon --inspect src/index.js
const db = require('./config/db');
db.connect();

const app = express();
const port = 3001;

const route = require('./routes');  

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
  extended: true
}));

app.use(express.json())
app.use(methodOverride('_method'));
app.use(morgan('combined'));
app.use(sortMidleware);



// Template engine
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: require('./helpers/handlebars')
}));
app.set('view engine', 'hbs');

app.set('views', path.join(__dirname, 'resources\\views'));

route(app);
app.listen(port, () => {
  console.log(`App listening at http://13.228.225.19:${port}`);
});