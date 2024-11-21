import { Application } from 'express';
import middleware from '../middleware/modules';
import home from './home';

const router = (app: Application) => {
  app.use(
    '/api',
    //  [middleware.validate],
    home
  );
};
export default router;
