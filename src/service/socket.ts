import { Server as HttpServer } from 'http';
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { KeysAlert, TypesAlert } from '../types/Socket';
import DAO from '../DAO';
import { jwtDecode } from 'jwt-decode';

interface DadosSocket<T> {
  data: T;
}

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;
  public keys: { [key in KeysAlert]: TypesAlert } = {
    teste: 'Teste',
  };

  public users: { [uid: string]: string };

  constructor(server: HttpServer) {
    ServerSocket.instance = this;
    this.users = {};
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: '*',
      },
    });

    this.io.on('connect', (socket: Socket) => {
      this.safeExecute(() => {
        this.startListeners(socket);
        console.info('Socket connected:', socket.id);
      }, 'Error during socket connection');
    });
  }

  private safeExecute = (fn: Function, errorMsg: string) => {
    try {
      fn();
    } catch (error) {
      console.error(errorMsg, error);
    }
  };

  private logError = (msg: string, error?: any) => {
    console.error(`[Error]: ${msg}`, error || '');
  };

  private validateToken = (token: string): boolean => {
    try {
      const decoded = jwtDecode(token);
      if (
        decoded &&
        typeof decoded === 'object' &&
        decoded.exp &&
        Date.now() < decoded.exp * 1000
      ) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  private getUidFromSocketID = (id: string): string | undefined => {
    return Object.keys(this.users).find((uid) => this.users[uid] === id);
  };

  private sendMessage = (name: string, users: string[], payload?: Object) => {
    users.forEach((id) => {
      if (payload) {
        this.io.to(id).emit(name, payload);
      } else {
        this.io.to(id).emit(name);
      }
    });
  };

  private startListeners = (socket: Socket) => {
    const token = socket.handshake.auth.token;

    if (!this.validateToken(token)) {
      this.logError('Invalid token, disconnecting socket:', token);
      return socket.disconnect();
    }

    console.info('Socket handshake received:', socket.id);

    socket.on(
      'handshake',
      (callback: (uid: string, users: string[]) => void) => {
        this.safeExecute(() => {
          const reconnected = Object.values(this.users).includes(token);

          if (reconnected) {
            console.info('User reconnected:', token);
            const uid = this.getUidFromSocketID(token);
            const users = Object.values(this.users);

            if (uid) {
              callback(uid, users);
              return;
            }
          }

          const uid = uuidv4();
          this.users[uid] = token;
          const users = Object.values(this.users);
          callback(uid, users);

          this.sendMessage(
            'user_connected',
            users.filter((id) => id !== token),
            users
          );
        }, 'Error during handshake');
      }
    );

    socket.on('disconnect', () => {
      this.safeExecute(() => {
        console.info('Socket disconnected:', socket.id);
        const uid = this.getUidFromSocketID(token);

        if (uid) {
          delete this.users[uid];
          const users = Object.values(this.users);
          this.sendMessage('user_disconnected', users, socket.id);
        }
      }, 'Error during socket disconnection');
    });

    socket.on('error', (err) => {
      this.logError('Socket error:', err);
      socket.disconnect();
    });
  };

  public sendAlert = async (key: TypesAlert, payload: DadosSocket<any>) => {
    this.safeExecute(async () => {
      let usersAlert: number[] = [];
      this.io.emit(key, { ...payload, USERS: usersAlert });
    }, `Error sending alert for key: ${key}`);
  };
}
