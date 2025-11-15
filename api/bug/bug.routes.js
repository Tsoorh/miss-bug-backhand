import express from 'express';
import { getBug, getBugs, getPDF, removeBug, saveBug } from './bug.controller.js';
import { requireAuth } from '../../middlewares/require-auth.middleware.js';


const router = express.Router()

router.get("/",getBugs );
router.get("/:bugId",getBug);
router.delete("/:bugId",requireAuth,removeBug);
router.put("/:bugId",requireAuth,saveBug); // update
router.post("/",requireAuth,saveBug); // new
router.get("/pdf",getPDF);

export const bugRoutes = router

