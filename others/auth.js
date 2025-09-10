function authMiddleware(req, res, next) {
    const password = req.query.password;
    if(password && password === process.env.ADMIN_PW) return next();
    return res.sendStatus(401);
}

module.exports = authMiddleware;