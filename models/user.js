const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  movieName: { type: String, required: true },
  isTop10: { type: Boolean, default: false },
  yearOfPublish: { type: String, required: true },
  rate: { type: Number, required: true, min: 1, max: 10 },
  genre : {type: String , require:true},
  //To add username 
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  movies:[
    movieSchema
  ]
});

// module.exports = mongoose.model('User', userSchema);
const User = mongoose.model('User', userSchema)
module.exports = User;