import express from "express";
import { validateToken } from "../../../helpers/jwtValidator";
import { getAllRoles } from "../../../controllers/security/roles/roles.controller";

const router = express.Router();

router.route("/api/roles").get(validateToken, getAllRoles);

module.exports = router;
