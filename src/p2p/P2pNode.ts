import { createConnection, Socket } from 'node:net';
import { TypedEventEmitter } from '../event_emitter/TypedEventEmitter.js';
import { State } from './State.js';
import { Host } from './Host.js';
import { Messenger } from './Messenger.js';

export const P2pNodeState = {
  NEW: 'NEW',
  CONNECTED: 'CONNECTED',
  CONNECTING: 'CONNECTING',
  DISCONNECTING: 'DISCONNECTING',
  CLOSED: 'CLOSED',
} as const;

export type P2pNodeEventMap = {
  stateChange: (state: keyof typeof P2pNodeState) => void;
  connect: () => void;
  end: () => void;
  error: (error: unknown) => void;
  close: (hadError: boolean) => void;
  message: (message: P2pNodeMessage) => void;
};

export type P2pNodeMessage = { command: string; data: unknown };

export type P2pNodeMessageMap = {};

export class P2pNode extends TypedEventEmitter<P2pNodeEventMap> {
  public lastSeen?: Date;
  private socket: Socket;
  private readonly state = new State<typeof P2pNodeState>(P2pNodeState.NEW);
  private readonly messenger = new Messenger();

  constructor(private readonly host: Host) {
    super();

    this.state.on('stateChange', (state) => this.emit('stateChange', state));
  }

  connect(socket?: Socket): Socket {
    this.state.setState(P2pNodeState.CONNECTING);

    if (!socket) {
      this.socket = createConnection(
        this.host.port,
        this.host.host,
        this._handleConnect.bind(this),
      );
    } else {
      this.socket = socket;
      this.state.setState(P2pNodeState.CONNECTED);
    }

    this.socket.on('error', this._handleError.bind(this));
    this.socket.on('data', this._handleData.bind(this));
    this.socket.on('end', this._handleEnd.bind(this));
    this.socket.on('close', this._handleClose.bind(this));

    return this.socket;
  }

  disconnect(): void {
    this.state.setState(P2pNodeState.DISCONNECTING);
    this.socket.end();
  }

  private _handleConnect(): void {
    this.state.setState(P2pNodeState.CONNECTED);
    this.emit('connect');
  }

  private _handleError(error: unknown): void {
    this.emit('error', error);
  }

  private _handleData(data: Buffer<ArrayBufferLike>): void {
    this.lastSeen = new Date();
    const message: P2pNodeMessage = JSON.parse(data.toString());

    this._handleMessage(message);
  }

  private _handleMessage(message: P2pNodeMessage): void {
    this.emit('message', message);
  }

  private _handleEnd(): void {
    this.emit('end');
  }

  private _handleClose(hadError: boolean): void {
    this.state.setState(P2pNodeState.CLOSED);

    this.emit('close', hadError);
  }

  async send(command: string, data: unknown): Promise<Error | null> {
    return new Promise<Error | null>((resolve) => {
      return this.socket.write(
        JSON.stringify({
          command,
          data,
        }),
        (error) => resolve(error ?? null),
      );
    });
  }
}
