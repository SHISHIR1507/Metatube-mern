import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

//common middlewares
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({
    limit: "16kb"
}))
app.use(express.urlencoded({
    limit: "16kb",
    extended: true
})) 
app.use(express.static("public")) // serving static files from public directory
app.use(cookieParser()) // parsing cookies

//importing routes
import healthcheckRouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
// routes
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/comments', commentRouter);


export {app}