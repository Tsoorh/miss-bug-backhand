import { authService } from "../api/auth/auth.service.js";

export async function requireAuth(req,res,next) {
    const encLoginToken = req.cookies.loginToken;
    if (!encLoginToken) res.status(401).send("Please login")

    req.loggedinUser =await authService.validateToken(encLoginToken);
    
    next();
}