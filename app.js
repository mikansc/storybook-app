const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;
const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method Override
app.use(methodOverride('_method'));

// Loggin
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Handlebars helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require('./helpers/hbs');

//Handlebars View Engine
app.engine(
  '.hbs',
  exphbs({
    helpers: { formatDate, stripTags, truncate, editIcon, select },
    defaultLayout: 'main',
    extname: '.hbs',
  })
);
app.set('view engine', '.hbs');

//Session Middleware (above passport middleware)
app.use(
  session({
    secret: 'aline passos',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Set Global var
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

// Load config
dotenv.config({ path: './config/config.env' });

//passport config
require('./config/passport')(passport);

connectDB();

app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
