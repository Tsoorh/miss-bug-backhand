import { bugService } from "../api/bug/bug.service.js"

export async function checkBugs(req,res,next){
    const {userId} = req.params
    console.log("🚀 ~ checkBugs ~ userId:", userId)
    const bugs = await bugService.query();
    const isOwnBugs = bugs.some(bug=> bug.creator._id === userId)
    if(isOwnBugs) return res.status(401).send('Cannot delete a bug owner!');
    
    console.log("🚀 ~ checkBugs ~ isOwnBugs:", isOwnBugs)

    next()
}