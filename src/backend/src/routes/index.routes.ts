import { Router } from "express";

const router = Router();

router.use(require("./auth.routes"));

export default router;
