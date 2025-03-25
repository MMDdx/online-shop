const express = require('express');
const helmet = require('helmet');
const app = express();
const morgan = require("morgan")
const cors = require('cors');
const productRoutes = require('./routes/productRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const reviewRoutes = require('./routes/reviewRoutes.js');
const globalErrorHandler = require('./controllers/ErrorController.js');
const likeRouter = require('./routes/likeRoutes');
const qs = require('qs');

app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.set('query parser', str => qs.parse(str));

app.use(express.static("./public"))

app.use(helmet({contentSecurityPolicy: false}))
// implement CORS
app.use(cors())
// access Control Allow Origin
app.options(/.*/, cors())

if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

app.use("/api/v1/products", productRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/reviews", reviewRoutes)
app.use("/api/v1/likes", likeRouter)

app.use(globalErrorHandler)

module.exports = app;