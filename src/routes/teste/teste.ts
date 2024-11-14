import { Router } from 'express';
import middleware from '../../middleware/modules';
import testeController from '../../controller/teste/testeController';

const router = Router();

router.get('/teste', testeController.teste);

export default router;
