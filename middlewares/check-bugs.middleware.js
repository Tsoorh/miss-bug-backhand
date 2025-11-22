import { bugService } from "../api/bug/bug.service.js"

export async function checkBugs(req,res,next){
    const {userId} = req.params
    const filterBy = {txt:'',severity:0,creator:{_id:userId}}
    const bugs = await bugService.query(filterBy);
    console.log("🚀 ~ checkBugs ~ bugs:", bugs)

    if(bugs.length>0) return res.status(401).send('Cannot delete a bug owner!');
    

    next()
}