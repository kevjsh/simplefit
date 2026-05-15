import { Router } from "express";

const router = Router();

router.use(require("./auth.routes"));
router.use(require("./customer.routes"));

export default router;
