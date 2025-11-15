import express from 'express';
import { getUser, getUsers, removeUser, saveUser } from './user.controller.js';

const router = express.Router();

router.get("/",getUsers)
router.get("/:userId",getUser)
router.put("/:userId",saveUser)
router.post("/",saveUser)
router.delete("/:userId",removeUser)

export const userRoutes = router;
