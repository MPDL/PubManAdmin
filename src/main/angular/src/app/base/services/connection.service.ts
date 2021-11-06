import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable()
export class ConnectionService {
  private initial_value = environment.base_url;
  private connection = new BehaviorSubject<string>(this.initial_value);
  connectionService = this.connection.asObservable();

  constructor() {}

  setConnection(connectionService: string) {
    this.connection.next(connectionService);
  }
}
