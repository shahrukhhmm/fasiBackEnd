const dotenv = require('dotenv').config();

// if (dotenv.error) {
//   console.error(dotenv.error);
//   throw dotenv.error;
// }

const Port = process.env.PORT;
const connection_String = process.env.mongo_db_connection_string;
const jwtAccessKey = process.env.access_Secret_Key;
const jwtRefreshKey= process.env.refresh_Secret_Key;

module.exports = { Port, connection_String,jwtAccessKey,jwtRefreshKey };
