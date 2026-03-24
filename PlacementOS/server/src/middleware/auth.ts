import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthRequest } from "../types/auth.js";

interface JwtPayload {
  sub: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.supabaseJwtSecret) as JwtPayload;
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
