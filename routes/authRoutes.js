const express = require("express");

const {
    login,
    getProfile
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.get("/profile", getProfile);

module.exports = router;