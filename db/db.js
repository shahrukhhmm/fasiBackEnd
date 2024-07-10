const mongoose = require('mongoose');
const { connection_String } = require('../config/config')


const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(connection_String);
        console.log("DataBase is Connected to Host " + conn.connection.host);
    } catch (error) {
        console.log(`Error is ${error}`);
    }
}
module.exports = {
    dbConnect
}