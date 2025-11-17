import express from 'express';
import { getUser, getUsers, removeUser, saveUser } from './user.controller.js';
import { adminOnly } from '../../middlewares/admin-only.middleware.js';
import { checkBugs } from '../../middlewares/check-bugs.middleware.js';

const router = express.Router();

router.get("/",adminOnly,getUsers)
router.get("/:userId",adminOnly,getUser)
router.put("/:userId",adminOnly,saveUser)
router.post("/",adminOnly,saveUser)
router.delete("/:userId",adminOnly,checkBugs,removeUser)

export const userRoutes = router;
