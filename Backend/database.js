const mongoose = require('mongoose');
require('dotenv').config();

const initDatabase = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/code_veda';
        
        await mongoose.connect(uri);
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error;
    }
};

module.exports = {
    initDatabase
};
