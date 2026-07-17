import express from "express";
import { validateToken } from "../../../helpers/jwtValidator";
import { authorizePermission } from "../../../middlewares/authorize";
import {
  getAllRolePermissions,
  createRolePermission,
  deleteRolePermission,
} from "../../../controllers/security/authorize/rolePermissions.controller";

const router = express.Router();

router.route("/api/role-permissions").get(
  validateToken,
  authorizePermission(["role.permissions.read"]),
  getAllRolePermissions,
);

router.route("/api/role-permissions").post(
  validateToken,
  authorizePermission(["role.permissions.create"]),
  createRolePermission,
);

router.route("/api/role-permissions/:roleId/:permissionId").delete(
  validateToken,
  authorizePermission(["role.permissions.delete"]),
  deleteRolePermission,
);

module.exports = router;
