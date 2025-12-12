const express = require("express");
const router = express.Router();
const { evaluateProfileStrength } = require("../controllers/evaluateController");

router.get("/", evaluateProfileStrength);

module.exports = router;
