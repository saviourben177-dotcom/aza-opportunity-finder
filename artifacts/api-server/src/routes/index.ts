import { Router, type IRouter } from "express";
import healthRouter from "./health";
import opportunitiesRouter from "./opportunities";
import ingestRouter from "./ingest";

const router: IRouter = Router();

router.use(healthRouter);
router.use(opportunitiesRouter);
router.use(ingestRouter);

export default router;
