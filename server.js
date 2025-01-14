const express = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const addUserToViews = require('./middleware/addUserToViews');
require('dotenv').config();
require('./config/database');

// Controllers
const authController = require('./controllers/auth');
const isSignedIn = require('./middleware/isSignedIn');
const Movie = require('./models/movie');

const app = express();
// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : '3000';
const path = require('path');

// MIDDLEWARE
//for stylesheet

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride('_method'));
// Morgan for logging HTTP requests
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

app.use(addUserToViews);

// Public Routes
app.get('/', async (req, res) => {
  res.render('index.ejs');
});

app.use('/auth', authController);

// Protected Routes
app.use(isSignedIn);

app.get('/protected', async (req, res) => {
  if (req.session.user) {
    res.send(`Welcome to the party ${req.session.user.username}.`);
  } else {
    res.sendStatus(404);
    // res.send('Sorry, no guests allowed.');
  }
});
//Routes  

app.get("/movies", async (req, res) => {
  const allMovies = await Movie.find({ userId: req.session.userId });  // Fetch only movies of the logged-in user
  res.render("movies/index.ejs", { movies: allMovies });
});

// Add a new movie form
app.get("/movies/new", (req, res) => {
  res.render("movies/new.ejs");
});

// Create a new movie
app.post("/movies", async (req, res) => {
  if (req.body.isTop10 === "on") {
    req.body.isTop10 = true;
  } else {
    req.body.isTop10 = false;
  }

  // Associate the movie with the logged-in user (via userId from session)
  const movieData = {
    movieName: req.body.movieName,
    isTop10: req.body.isTop10,
    yearOfPublish: req.body.yearOfPublish,
    rate: req.body.rate,
    genre: req.body.genre,
    // userId: req.session.userId, // This associates the movie with the user
  };

  await Movie.create(movieData);
  res.redirect("/movies");
});

// Show a specific movie by ID
app.get("/movies/:movieId", async (req, res) => {
  const foundMovie = await Movie.findById(req.params.movieId);
  res.render("movies/show.ejs", { movie: foundMovie });
});
//List movies 
app.get("/movies",async(req ,res)=>{
  const movies=await Movie.find();
  res.render('movies',{movies});
});
//To Delete 
app.delete("/movies/:movieId", async (req, res) => {
  await Movie.findByIdAndDelete(req.params.movieId);
  res.redirect("/movies");
});

//To open Edit page 
app.get("/movies/:movieId/edit", async (req, res) => {
  const foundMovie = await Movie.findById(req.params.movieId);
  res.render("movies/edit.ejs", {
    movie: foundMovie,
  });
});
//To Update the movie
app.put("/movies/:movieId", async (req, res) => {
  if (req.body.isTop10 === "on") {
    req.body.isTop10 = true;
  } else {
    req.body.isTop10 = false;
  }
  
  await Movie.findByIdAndUpdate(req.params.movieId, req.body);

  res.redirect(`/movies/${req.params.movieId}`);
});
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`The express app is ready on port ${port}!`);
});
