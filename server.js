import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { bugService } from "./services/bug.service.js";
import { loggerService } from "./services/logger.service.js";

const app = express();

// **************config****************
const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
};

// middlewares
app.use(cors(corsOptions));
app.use(cookieParser());

// Bug CRUDL

// Read/List
app.get("/api/bug", async (req, res) => {
  try {
    const bugs = await bugService.query();
    res.send(bugs);
  } catch (err) {
    loggerService.error(err);
    res.status(400).send(`couldn't get bug`);
  }
});

// Add/Update
app.get("/api/bug/save", async (req, res) => {
  const bugToSave = {
    _id: req.query._id,
    title: req.query.title,
    severity: +req.query.severity,
    description: req.query.description,
    createdAt: req.query.createdAt,
  };
  try {
    await bugService.save(bugToSave);
    res.send(bugToSave);
  } catch (err) {
    loggerService.error(err);
    res.status(400).send(`Couldn't save bug`);
  }
});

//pdf
app.get("/api/bug/pdf", async (req, res) => {
  try {
    await bugService.createPDF(res);
  } catch (err) {
    loggerService.error(`coudln't create pdf`);
    res.status(400).send(`Couldn't create pdf`, err);
  }
});

// Read
app.get("/api/bug/:bugId", async (req, res) => {
  const { bugId } = req.params;
  try {
    const bug = await bugService.getById(bugId);
    const visitedBugs = req.cookies.visitedBugs || [] 
    visitedBugs.push(bugId);
    console.log('User visited the following bugs: ',visitedBugs)

    let cookieOptions={}
    const maxAge= 7000;
    if (visitedBugs.length > 2){
      cookieOptions = {maxAge: maxAge}
    } 

    res.cookie('visitedBugs',visitedBugs,cookieOptions)
    res.send(bug);
  } catch (err) {
    loggerService.error(`couldn't get bug ${bugId}`, err);
    res.status(400).send(`couldn't get bug`);
  }
});

// delete
app.get("/api/bug/:bugId/remove", async (req, res) => {
  const { bugId } = req.params;
  try {
    await bugService.remove(bugId);
    res.send("Removed successfully");
  } catch (err) {
    loggerService.error(`couldn't remove bug ${bugId}`, err);
    res.status(400).send(`Couldn't remove bug`);
  }
});

app.get("/set-cookies", async (req, res) => {
  try {
    console.log("req.cookies", req.cookies);
    const viewedBugs = await bugService.getThreeIds();
    res.cookie("visitedBugs", viewedBugs);
    res.send("cookie SET!");
  } catch (err) {
    loggerService.error(err);
    res.status(400).send("Couldnt set cookie");
  }
});

app.listen(3030, () => console.log("Server ready at port 3030"));
