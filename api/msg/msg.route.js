import express from 'express';
import { adminOnly } from "../../middlewares/admin-only.middleware.js";
import { requireAuth } from "../../middlewares/require-auth.middleware.js";
import { getMsg,getMsgs,removeMsg,saveMsg } from "./msg.controller.js";


const router = express.Router();


router.get("/",getMsgs)
router.get("/:msgId",getMsg)
router.post("/",requireAuth,saveMsg)
router.put("/:msgId",requireAuth,saveMsg)
router.delete("/:msgId",adminOnly,removeMsg)

export const msgRoutes = router

