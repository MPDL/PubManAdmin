import {Injectable} from '@angular/core';
import {Client} from 'elasticsearch';
import {environment} from 'environments/environment';
import {ConnectionService} from './connection.service';

@Injectable()
export class ElasticBaseService {
  client: Client;
  uri: string;

  constructor(
    protected connectionService: ConnectionService,
  ) {
    if (!this.client) {
      this.connectionService.connectionService$.subscribe((data:string) => {
        this.uri = data + environment.elasticUrl;
        this.connect(this.uri);
      });
    }
  }

  private connect(uri: string) {
    this.client = new Client({
      host: uri,
      log: ['error', 'warning'],
    });
  }
}
