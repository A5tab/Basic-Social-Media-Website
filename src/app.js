import express, { urlencoded } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"
const __dirname = 'src'
const app = express()


// we use app.use() when need to use middleware or do configuration
// mostly app.use() is used. This allows to define middleware with every request and allows for configurations

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})) // to make sharing between different systems
app.use(express.json({ limit: "16kb" })) // to accept json data from req.body
app.use(express.static("public")) // to store images in public folder
app.use(express.urlencoded({ extended: true })) // to get data from url and extended:true for nested objects
app.use(cookieParser()) // to access browser cookies and to set them

app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routes import
import userRouter from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users", userRouter)
export { app }