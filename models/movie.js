const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  movieName: { type: String, required: true },
  isTop10: { type: Boolean, default: false },
  yearOfPublish: { type: String, required: true },
  rate: { type: Number, required: true, min: 1, max: 10 },
  genre : {type: String , require:true},
})

const Movie = mongoose.model('Movie', movieSchema)
module.exports = Movie;
