import express from "express";

const router = express.Router();

router.use(require("./permissions.routes"));
router.use(require("./rolePermissions.routes"));

module.exports = router;
