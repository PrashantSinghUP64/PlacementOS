import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
function createToken(userId) {
    return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "7d" });
}
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "name, email and password are required" });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = createToken(user.id);
    return res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
    });
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = createToken(user.id);
    return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
    });
});
router.get("/me", requireAuth, async (req, res) => {
    const user = await User.findById(req.userId).select("name email");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.json({ id: user.id, name: user.name, email: user.email });
});
export default router;
