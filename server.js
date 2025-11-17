// import dotenv from 'dotenv';
// dotenv.config();


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { loggerService } from "./services/logger.service.js";
import { bugService } from "./api/bug/bug.service.js";


const app = express();

// **************config****************
const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
};

// middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.set('query parser', 'extended');



import { bugRoutes } from "./api/bug/bug.routes.js";
import { userRoutes } from "./api/user/user.routes.js";
import { authRoutes } from "./api/auth/auth.routes.js";

app.use('/api/bug',bugRoutes)
app.use('/api/user',userRoutes)
app.use('/api/auth',authRoutes)



//cookies request
app.get("/set-cookies", async (req, res) => {
  try {
    const viewedBugs = await bugService.getThreeIds();
    res.cookie("visitedBugs", viewedBugs);
    res.send("cookie SET!");
  } catch (err) {
    loggerService.error(err);
    res.status(400).send("Couldnt set cookie");
  }
});

//* For SPA (Single Page Application) - catch all routes and send to the index.html
// app.get('/*all', (req, res) => {
//     res.sendFile(path.resolve('public/index.html'))
// })

app.listen(3030, () => console.log("Server ready at port 3030"));
