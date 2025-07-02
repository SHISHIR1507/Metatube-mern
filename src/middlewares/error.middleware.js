import mongoose from "mongoose";
import {ApiError} from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error =err
    
    if(!(error instanceof ApiError)){

        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode,message,error?.errors || [], error.stack);
    }
    const response = {
        ...error,
        message: error.message,
        ...err(process.env.NODE_ENV === "development" ? {stack: error.stack} : {})
    };

    return res.status(error.statusCode).json(response)
};

export {errorHandler};

// Usage in app.js
// import { errorHandler } from './middlewares/error.middleware.js';
// app.use(errorHandler); // Add this line after all routes and before the server listen
// This will catch all errors and send a structured response
// Make sure to place this after all your routes in app.js
// app.use("/api/v1/users", userRouter);
// app.use(errorHandler); // This should be the last middleware
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
// This will ensure that any unhandled errors in your routes will be caught by this middleware and a proper response is sent to the client. 
