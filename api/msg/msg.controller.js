import { ObjectId } from "mongodb";
import { asyncLocalStorage } from "../../services/als.service.js";
import { loggerService } from "../../services/logger.service.js";
import { msgService } from "./msg.service.js";

export async function getMsgs(req, res) {
    try {
        const filterBy = {
            txt: req?.query?.txt || null,
            bugId: req?.query?.bugId || null,
            userId: req?.query?.userId || null
        }
        const msgs = await msgService.query(filterBy)
        res.json(msgs);
    } catch (err) {
        loggerService.error(err)
        res.status(400).send('Couldnt get messages!')
    }
}

export async function getMsg(req, res) {
    const { msgId } = req.params
    try {
        const msg = await msgService.getById(msgId);
        res.json(msg)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send('Couldnt get message!')
    }
}

export async function removeMsg(req, res) {
    const { msgId } = req.params
    try {
        const id = await msgService.remove(msgId)
        res.json(id);
    } catch (err) {
        loggerService.error(err)
        res.status(400).send('Couldnt remove message!')
    }
}

export async function saveMsg(req, res) {
    const msg = req.body
    const {loggedinUser} = await asyncLocalStorage.getStore()
    const {aboutBugId} = msg
    const byUserId = loggedinUser._id
    
    msg.byUserId = ObjectId.createFromHexString(byUserId)
    msg.aboutBugId = ObjectId.createFromHexString(aboutBugId)
    var msgRes = msg;
    try {
        if (msg._id) {
            msgRes = await msgService.update(msg);
        } else {
            console.log("inElse");
            msgRes = await msgService.add(msg);
        }
        console.log("🚀 ~ saveMsg ~ msgRes:", msgRes)
        res.json(msgRes)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send('Couldnt save message!')
    }
}
