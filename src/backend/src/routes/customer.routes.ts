import express from "express";
import { param } from "express-validator";
import { validation } from "../middlewares/validation";
import { lookupByNID } from "../controllers/customer.controller";

const router = express.Router();

router.route("/api/customer/lookup/:nid").get([
  param("nid", "NID is required and must not be empty.")
    .notEmpty()
    .isAlphanumeric()
    .withMessage("NID must contain only letters and numbers."),
  validation,
], lookupByNID);

module.exports = router;
