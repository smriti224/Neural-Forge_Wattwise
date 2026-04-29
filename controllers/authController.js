const users = require("../data/users");

const DUMMY_TOKEN = "dummy-token-123";

// Simple in-memory active user for hackathon demo
let activeUser = null;

const login = (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    const user = users.find(
        (item) => item.email === email && item.password === password
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    activeUser = {
        email: user.email,
        role: user.role
    };

    return res.status(200).json({
        success: true,
        role: user.role,
        token: DUMMY_TOKEN
    });
};

const getProfile = (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader !== `Bearer ${DUMMY_TOKEN}`) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    if (!activeUser) {
        return res.status(401).json({
            success: false,
            message: "No active login session"
        });
    }

    return res.status(200).json({
        email: activeUser.email,
        role: activeUser.role
    });
};

module.exports = {
    login,
    getProfile
};