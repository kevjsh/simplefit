import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.send("API is working as expected");
});

router.use(require("./auth.routes"));
router.use(require("./customer.routes"));
router.use(require("./security"));

export default router;
