const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  festivals: [{
    type: String,
    trim: true
  }],
  foods: [{
    type: String,
    trim: true
  }],
  colorTheme: {
    type: String,
    enum: ['rajasthan', 'kerala', 'punjab', 'default'],
    default: 'default'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Destination', destinationSchema);
