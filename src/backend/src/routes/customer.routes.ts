import express from "express";
import multer from "multer";
import { body, param } from "express-validator";
import { validation } from "../middlewares/validation";
import { validateToken } from "../helpers/jwtValidator";
import { authorizePermission } from "../middlewares/authorize";
import { lookupByNID, getCustomers, updateStatus, updateDetails, getProfileByEmail, uploadProfilePicture, updateProfile } from "../controllers/customer.controller";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route("/api/customers").get(
  validateToken,
  authorizePermission(["customers.read"]),
  getCustomers,
);

router.route("/api/customers/:id/status").patch([
  param("id", "Customer id is required.").notEmpty().isString(),
  body("status", "Status is required.")
    .notEmpty()
    .isString()
    .custom((value) => {
      const normalized = String(value).trim().toUpperCase();
      if (normalized !== "ACTIVE" && normalized !== "INACTIVE") {
        throw new Error("Status must be ACTIVE or INACTIVE.");
      }
      return true;
    }),
  validation,
  validateToken,
  authorizePermission(["customers.update"]),
], updateStatus);

router.route("/api/customers/:id/details").patch([
  param("id", "Customer id is required.").notEmpty().isString(),
  body("details").optional({ nullable: true }).isString(),
  validation,
  validateToken,
  authorizePermission(["customers.update"]),
], updateDetails);

router.route("/api/customer/lookup/:nid").get([
  param("nid", "NID is required and must not be empty.")
    .notEmpty()
    .isAlphanumeric()
    .withMessage("NID must contain only letters and numbers."),
  validation,
], lookupByNID);

router.route("/api/customer/profile/:email").get([
  param("email", "A valid email is required.")
    .notEmpty()
    .isEmail()
    .withMessage("Must be a valid email address."),
  validation,
], getProfileByEmail);

router.route("/api/customer/profile/:email").put([
  param("email", "A valid email is required.")
    .notEmpty()
    .isEmail()
    .withMessage("Must be a valid email address."),
  validation,
], validateToken, updateProfile);

router.route("/api/customer/profile-picture").post(
  validateToken,
  upload.single("profilePicture"),
  uploadProfilePicture,
);

module.exports = router;
