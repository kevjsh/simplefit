import express from "express";
import { validateToken } from "../../../helpers/jwtValidator";
import { authorizePermission } from "../../../middlewares/authorize";
import {
  createUserRole,
  deleteUserRole,
  deactivateUserRole,
  activateUserRole,
  getAllUserRoles,
} from "../../../controllers/security/roles/user.roles.controller";

const router = express.Router();

router
  .route("/api/roles/user")
  .post(validateToken, authorizePermission(["user.role.create"]), createUserRole);

router
  .route("/api/roles/users")
  .get(validateToken, authorizePermission(["user.role.read"]), getAllUserRoles);

router
  .route("/api/roles/user/:id")
  .delete(validateToken, authorizePermission(["user.role.delete"]), deleteUserRole);

router
  .route("/api/roles/user/:id/deactivate")
  .patch(validateToken, authorizePermission(["user.role.update"]), deactivateUserRole);

router
  .route("/api/roles/user/:id/activate")
  .patch(validateToken, authorizePermission(["user.role.update"]), activateUserRole);

module.exports = router;
