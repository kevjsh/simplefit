import express from "express";
import { validateToken } from "../../../helpers/jwtValidator";
import { authorizePermission } from "../../../middlewares/authorize";
import {
  getAllPermissions,
  createPermission,
  deletePermission,
} from "../../../controllers/security/authorize/permissions.controller";

const router = express.Router();

router.route("/api/permissions").get(
  validateToken,
  authorizePermission(["permissions.read"]),
  getAllPermissions,
);

router.route("/api/permissions").post(
  validateToken,
  authorizePermission(["permissions.create"]),
  createPermission,
);

router.route("/api/permissions/:id").delete(
  validateToken,
  authorizePermission(["permissions.delete"]),
  deletePermission,
);

module.exports = router;
