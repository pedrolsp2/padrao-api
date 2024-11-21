import { Request, Response } from 'express';
import DAO from '../../DAO';
import log from '../../middleware/logger';
import queryGen from '../../utils/queryGen';
import { socketFunctions } from '../../http/server';

const { queryInsertSingle, queryUpdate } = queryGen;

export default {
  async welcom(req: Request, res: Response) {
    try {
      res.send({ message: 'Tudo ok' });
      socketFunctions.sendAlert('Teste');
    } catch (error) {
      log(`512 - Erro de execucao do controller: ${error}`);
      res.status(512).json({
        status: 512,
        body: error,
      });
    }
  },
};
