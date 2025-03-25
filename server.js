const mongoose = require("mongoose")
const dotenv = require("dotenv");

process.on('uncaughtException', (err) => {
    console.log("unhandled Exception!!!. Shutting down...");
    console.log(err)
    console.log(err.name, err.message);
    process.exit(1)
})

dotenv.config({path:"./config.env"})

const app = require("./app.js");

mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    // these are not supported in mongoose 6 and above!
    // useCreateIndex: true,
    // useFindAndModify: false
}).then(con => console.log("Connected to DB!"));


const port = process.env.PORT || 3000;

const server = app.listen(port, "0.0.0.0",() => {
    console.log("Server running on port: " + process.env.PORT);
})


process.on('unhandledRejection', (err) => {
    console.log("unhandled rejection!!!. Shutting down...");
    console.log(err.name, err.message);
    console.log(err)
    server.close(() => {
        process.exit(1)
    })
})
