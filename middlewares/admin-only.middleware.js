import { authService } from "../api/auth/auth.service.js"

export async function adminOnly(req,res,next) {
    console.log(req.cookies);
    
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    console.log("🚀 ~ adminOnly ~ loggedinUser.isAdmin:", loggedinUser.isAdmin)
    if(!loggedinUser.isAdmin) res.status(401).send('No permission!')

    next()
}