const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors')
const cookieParser = require('cookie-parser')

const morgan = require("morgan");
const { Port } = require('./config/config');

const errorHandler = require('./middleware/errorHandler');
const { dbConnect } = require('./db/db');

app.use(morgan("dev"));

const cloudinary = require('cloudinary').v2

app.use(bodyParser.json());

// body parser
app.use(express.json({ limit: "50mb" }))

app.use(cookieParser())

// cross origin resource sharing
app.use(cors({
    origin: ['http://localhost:3000', 'https://storage.googleapis.com'],
    credentials: true,
}))



// Connecting Database
dbConnect();

cloudinary.config({
    cloud_name: 'dcffvppph',
    api_key: '182912163181373',
    api_secret: 'qCJSfpyt7m48NlF6NUuatCz5G9w'
})


app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(errorHandler);

// Adding CORS middleware

// Requiring
const userRouter = require('./routes/userRouter');
const blogRouter = require('./routes/blogRouter');
const songRouter = require('./routes/songRouter');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
// Using statements
app.use('/api/user', userRouter);
app.use('/api/blog', blogRouter);
app.use('/api/song', songRouter);
app.use('/api/chat', chatRoutes);
app.use('/api/notification', notificationRoutes);

// Sample get Route
app.get('/', async(req, res) => {
    res.status(200).send("Welcome to E-Studio");
});

// Listening Server
app.listen(Port, () => {
    console.log("Server is Running On Port  " + Port);
});