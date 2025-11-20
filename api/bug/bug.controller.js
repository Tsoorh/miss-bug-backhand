import { loggerService } from "../../services/logger.service.js";
import { authService } from "../auth/auth.service.js";
import { bugService } from "./bug.service.js";

export async function getBugs(req, res) {
  const { sortBy, sortDir, pageIdx, txt, severity, labels } = req.query;
  const sort = { sortBy, sortDir: +sortDir };
  const filterBy = {
    txt: txt || '',
    severity: +severity || 0,
    labels: labels || [],
    pageIdx: +pageIdx || undefined
  };
  try {

    const bugs = await bugService.query(filterBy, sort);
    res.send(bugs);
  } catch (err) {
    loggerService.error(err);
    res.status(400).send(`couldn't get bug`);
  }
}

export async function getBug(req, res) {
  const { bugId } = req.params;
  try {
    const bug = await bugService.getById(bugId);
    const visitedBugs = req.cookies.visitedBugs || [];
    visitedBugs.push(bugId);
    console.log("User visited the following bugs: ", visitedBugs);

    let cookieOptions = {};
    const maxAge = 7000;
    if (visitedBugs.length > 2) {
      return res.status(401).send("")
      // cookieOptions = { maxAge: maxAge };
    }

    res.cookie("visitedBugs", visitedBugs, cookieOptions);
    res.send(bug);
  } catch (err) {
    loggerService.error(`couldn't get bug ${bugId}`, err);
    res.status(400).send(`couldn't get bug`);
  }
}

export async function removeBug(req, res) {
  const { bugId } = req.params;
  const loggedinUser = req.loggedinUser;

  try {
    const currentBug = await bugService.getById(bugId)
    if (currentBug.creator._id !== loggedinUser._id && !loggedinUser.isAdmin) throw 'No permission to remove!'

    await bugService.remove(bugId);
    res.send("Removed successfully");
  } catch (err) {
    loggerService.error(`couldn't remove bug ${bugId}`, err);
    res.status(400).send(`Couldn't remove bug`);
  }
}

export async function saveBug(req, res) {
  const { loggedinUser } = req;
  if (loggedinUser._id !== req.body.creator._id && !loggedinUser.isAdmin) throw 'No permission to save bug'

  const bugToSave = {
    _id: req.body._id || null,
    title: req.body.title,
    severity: +req.body.severity,
    description: req.body.description,
    createdAt: +req.body.createdAt,
    labels: req.body.labels,
    creator: {
      _id: req.body.creator._id || null,
      fullname: req.body.creator.fullname || null
    }
  };
  try {
    await bugService.save(bugToSave);
    res.send(bugToSave);
  } catch (err) {
    loggerService.error(err);
    res.status(400).send(`Couldn't save bug`);
  }
}

export async function getPDF(req, res) {
  try {
    await bugService.createPDF(res);
  } catch (err) {
    loggerService.error(`coudln't create pdf`);
    res.status(400).send(`Couldn't create pdf`, err);
  }
}
