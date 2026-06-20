import express from "express";
import multer from "multer";
import { param } from "express-validator";
import { validation } from "../middlewares/validation";
import { validateToken } from "../helpers/jwtValidator";
import { lookupByNID, getProfileByEmail, uploadProfilePicture, updateProfile } from "../controllers/customer.controller";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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
