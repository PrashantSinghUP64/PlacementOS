import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid authorization header" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, env.jwtSecret);
        req.userId = payload.sub;
        return next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
