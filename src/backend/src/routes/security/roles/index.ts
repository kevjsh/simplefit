import express from "express";

const router = express.Router();

router.use(require("./roles.routes"));
router.use(require("./user.roles.routes"));

module.exports = router;
