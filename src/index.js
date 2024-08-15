const express = require('express');
const morgan = require('morgan');
const path = require('path');
const handlebars = require('express-handlebars');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('combined'));

// Template engine
app.engine('hbs', handlebars.engine({extname: '.hbs'}));
app.set('view engine', 'hbs');

app.set('views', path.join(__dirname, 'resources\\views'));

app.get('/', function (req, res) {
  res.render('home');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});