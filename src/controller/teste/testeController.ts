import { Request, Response } from 'express';
import DAO from '../../DAO';
import log from '../../middleware/logger';
import queryGen from '../../utils/queryGen';

const { queryInsertSingle, queryUpdate } = queryGen;

export default {
  async teste(req: Request, res: Response) {
    try {
      res.send({ message: 'Tudo ok' });
    } catch (error) {
      log(`512 - Erro de execucao do controller: ${error}`);
      res.status(512).json({
        status: 512,
        body: error,
      });
    }
  },
};
