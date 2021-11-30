import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable()
export class ConnectionService {
  private initialValue = environment.baseUrl;
  private connection = new BehaviorSubject<string>(this.initialValue);

  connectionService = this.connection.asObservable();

  constructor(
  ) {}
}
