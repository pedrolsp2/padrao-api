import { Application } from 'express';
import middleware from '../middleware/modules';
import teste from './teste/teste';

const router = (app: Application) => {
  app.use(
    '/api',
    //  [middleware.validate],
    teste
  );
};
export default router;
