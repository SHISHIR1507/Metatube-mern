import express from "express"
import cors from "cors"

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
app.use(express.static("public"))

//importing routes
import healthcheckRouter from "./routes/healthcheck.routes.js"

// routes
app.use("/api/v1/healthcheck", healthcheckRouter)

export {app}