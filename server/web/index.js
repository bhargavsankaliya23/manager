const http = require("http");
const express = require("express");
const app = express();
const MongoConnect = require("../common/nosql/mongoDb/index");
const CONFIG = require("../config");
const _ = require("lodash");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./../swagger.json");

let server;
if (CONFIG.NODE_ENV === "development") {
    console.log("Your server is running on developer mode...!");
}
else if (CONFIG.NODE_ENV === "production") {
    console.log("Your server is running on production mode...!");
}
else if (CONFIG.NODE_ENV === "staging") {
    console.log("Your server is running on staging mode...!");
}


app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

MongoConnect.init()
    .then(() => {
        require("./middleware")(app);

        app.set("port", CONFIG.APP.WEB.PORT);
        server = http.createServer(app);

        server.listen(CONFIG.APP.WEB.PORT, err => {
            console.log(
                `your project API is listening on port ${CONFIG.APP.WEB.PORT}`
            );
        });

        server.on("error", onError);
    })
    .catch(err => {
        console.log(err);
        console.log("Unable to connect to database");
    });

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function shutdownServer() {
    server.close(() => {
        process.exit(0);
    });
    setTimeout(() => {
        process.exit(0);
    }, 5000);
}
process.stdin.resume();
process
    .on("SIGINT", () => {
        shutdownServer();
    })
    .on("SIGTERM", () => {
        shutdownServer();
    })
    .on("SIGTSTP", () => {
        shutdownServer();
    })
    .on("SIGTSTOP", () => {
        shutdownServer();
    })
    .on("SIGHUP", () => {
        shutdownServer();
    })
    .on("SIGQUIT", () => {
        shutdownServer();
    })
    .on("SIGABRT", () => {
        shutdownServer();
    })
    .on("unhandledRejection", err => {
        console.log("Unhandled reject throws: ");
        console.log(err);
    })
    .on("uncaughtException", err => {
        console.log("Uncaught exception throws: ");
        console.log(err);
        process.exit(1);
    });