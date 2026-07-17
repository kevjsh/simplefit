import express from "express";

const router = express.Router();

router.use(require("./authorize"));
router.use(require("./roles"));
router.use(require("./branches.routes"));

module.exports = router;
