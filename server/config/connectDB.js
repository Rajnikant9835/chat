
const mongoose = require('mongoose');

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URI);

        const connection = mongoose.connection;

        connection.on('connected ', () =>{
            console.log("successfully conected to DB")
        })
        connection.on('error',(error)=>{
            console.log("something is wrong in MongoDB", error);
        })
    }
    catch(error){
        console.log("something is wrong" , error)
    }
}

module.exports = connectDB

