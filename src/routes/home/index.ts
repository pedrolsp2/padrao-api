import { Router } from 'express';
import middleware from '../../middleware/modules';
import homeController from '../../controller/home/homeController';

const router = Router();

router.get('/', homeController.welcom);

export default router;
