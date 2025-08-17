const mongoose = require("mongoose");

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL,{});
        console.log('MongoDB connected');
    }catch(e){
        console.log('Error connecting to MongoDB',e);
        process.exit(1);
    }
}


module.exports = connectDB;