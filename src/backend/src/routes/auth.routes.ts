import express from "express";
import { check } from "express-validator";
import { validation } from "../middlewares/validation";
import { login, signup, changePassword, recoveryPassword } from "../controllers/auth.controller";

const router = express.Router();

router.route("/api/login").post([
  check("email", "A valid email is required.").notEmpty().isEmail(),
  check("password", "Password is required.").notEmpty(),
  validation,
], login);

router.route("/api/signup").post([
  check("NID", "NID is required.").notEmpty().isString(),
  check("Name", "Name is required.").notEmpty().isString(),
  check("FirstLastName", "FirstLastName is required.").notEmpty().isString(),
  check("SecondLastName", "SecondLastName is required.").notEmpty().isString(),
  check("Birthday", "Birthday is required and must be a valid date.").notEmpty().isISO8601(),
  check("Gender", "Gender is required.").notEmpty().isString(),
  check("FirstTelephone", "FirstTelephone is required.").notEmpty(),
  check("Address", "Address is required.").notEmpty().isString(),
  check("Email", "A valid email is required.").notEmpty().isEmail(),
  check("SecondTelephone").optional(),
  validation,
], signup);

router.route("/api/changePassword").post([
  check("email", "A valid email is required.").notEmpty().isEmail(),
  check("password", "Current password is required.").notEmpty(),
  check("newPassword", "New password is required.").notEmpty(),
  check("confirmation", "Password confirmation is required.").notEmpty(),
  validation,
], changePassword);

router.route("/api/recoveryPassword").post([
  check("email", "A valid email is required.").notEmpty().isEmail(),
  validation,
], recoveryPassword);

module.exports = router;
