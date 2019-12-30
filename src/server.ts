import {ApplicationConfig} from '@loopback/core';
import {Request, Response} from 'express';
import express = require('express');
import http from 'http';
import path = require('path');
import pEvent from 'p-event';
import {ShopApplication} from './application';

export class ExpressServer {
  private app: express.Application;
  private lbApp: ShopApplication;
  private server?: http.Server;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();
    this.lbApp = new ShopApplication(options);

    this.app.use('/api', this.lbApp.requestHandler);

    this.app.get('/', function(_req: Request, res: Response) {
      res.sendFile(path.resolve('public/express.html'));
    });

    this.app.get('/hello', function(_req: Request, res: Response) {
      res.send('Hello world!');
    });

    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  async boot() {
    await this.lbApp.boot();
  }

  public async start() {
    await this.lbApp.start();
    const port = this.lbApp.restServer.config.port || 3000;
    const host = this.lbApp.restServer.config.host || '127.0.0.1';
    this.server = this.app.listen(port, host);
    await pEvent(this.server, 'listening');
  }

  // For testing purposes
  public async stop() {
    if (!this.server) return;
    await this.lbApp.stop();
    this.server.close();
    await pEvent(this.server, 'close');
    this.server = undefined;
  }
}