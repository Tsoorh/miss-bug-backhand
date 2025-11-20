import { asyncLocalServer } from "../services/als.service.js"
import { authService } from "../api/auth/auth.service.js"

export function setupAsyncLocalStorage(req, res, next) {
    const storage = {}
    asyncLocalServer.run(storage, () => {
        if (!req.cookies?.loginToken) return next()
        const loggedinUser = authService.validateToken(req.cookies.loginToken);

        if (loggedinUser) {
            const alsStore = asyncLocalServer.getStore()
            alsStore.loggedinUser = loggedinUser
        }
        next();
    })

}