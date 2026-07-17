import express from "express";
import { validateToken } from "../../helpers/jwtValidator";
import { getAllBranches } from "../../controllers/security/branches.controller";

const router = express.Router();

router.route("/api/branches").get(validateToken, getAllBranches);

module.exports = router;
