import { Router } from "express";

import { registerUser,logoutUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";  
const router = Router();

router.route("/register").post(
    upload.fields([
        { 
            name: "avatar", 
            maxCount: 1 
        },
        { 
            name: "coverImage", 
            maxCount: 1 
        }
    ]),
    registerUser
);
//secured logoouts
router.route("/logout").post(verifyJWT,logoutUser)
export default router;