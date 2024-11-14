import { NextFunction, Request, Response } from 'express';
import DAO from '../DAO';
import queryGen from '../utils/queryGen';
const { queryInsertSingle } = queryGen;
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  usuario: Usuario;
  iat: number;
  exp: number;
}

interface Usuario {
  cod_usuario: number;
  nome: string;
  email: string;
  cod_filial: number;
  matricula: string;
}

interface CustomRequest<T = any> extends Request {
  atribuitoFaq?: string;
  atributos?: string;
}

export default {
  async checkPermission(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const token = req.headers['x-access-token'] as string;
      if (!token) {
        return res
          .status(401)
          .json({ status: 401, body: 'Token não fornecido' });
      }

      const decoded: DecodedToken = jwtDecode(token);

      const response = await fetch(
        `https://${process.env.API_ACCESS}/checkpermissiononrouter`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-cod_usuario': decoded.usuario.cod_usuario.toString(),
            'x-sistema': req.headers['x-sistema'] as string,
            'x-versao': req.headers['x-versao'] as string,
            'x-acao': req.method,
            'x-url': req.url,
          },
        }
      );
      const responseData: any = await response.json();
      if (
        req.url === '/faq' &&
        responseData.body === 'voce nao tem permissao'
      ) {
        req.atribuitoFaq = 'Visualização';
      } else {
        req.atribuitoFaq = 'Master';
      }

      if (
        responseData.body !== 'voce nao tem permissao' &&
        responseData.body !== undefined
      ) {
        req.atributos = responseData.body;
        return next();
      } else {
        if (req.url === '/faq') {
          return next();
        }
        return res
          .status(401)
          .json({ status: 401, body: 'Sem permissão de acesso' });
      }
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return res
        .status(401)
        .json({ status: 401, body: 'Sem permissão de acesso' });
    }
  },

  validate(req: any, res: any, next: any) {
    fetch(`https://${process.env.API_ACCESS}/tokenvalidation`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': req.headers['x-access-token'],
        'x-sistema': req.headers['x-sistema'],
        'x-versao': req.headers['x-versao'],
        'x-acao': req.method,
        'x-funcionalidade': req.url,
      },
    })
      .then((res: any) => {
        if (res.status !== 200) {
          res.status(401).json({
            status: 401,
            body: 'token expirou',
          });
        } else {
          next();
        }
      })
      .catch((error: any) => {
        console.log(error);
        res.status(401).json({
          status: 401,
          body: 'token expirou',
        });
      });
  },

  getUser(req: any, res: any, next: any) {
    let decoded: DecodedToken = jwtDecode(req.headers['x-access-token']);
    req.body.cod_usuario = decoded.usuario.cod_usuario;
    req.body.matricula = decoded.usuario.matricula;
    req.body.nome_usuario = decoded.usuario.nome;
    next();
  },
};
