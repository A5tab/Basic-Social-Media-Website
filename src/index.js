import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js"

// dotenv to manage .env varibales easily
// to config it using below method we use
// -r dotenv/config --experimenatl-json-modules
// inside dev command in package.json

dotenv.config(
    {
        path: './.env'
    }
)

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log("App is listening on port: ", process.env.PORT);
        })
        app.on("error", (error) => {
            console.error("App error: ", error);
            process.exit(1)
        })
    })
    .catch((error) => {
        console.log("MONGODB connection error!!!", error);
    })
