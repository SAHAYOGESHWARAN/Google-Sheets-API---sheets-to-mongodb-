const mongoose = require('mongoose');

const SheetDataSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SheetData', SheetDataSchema);
