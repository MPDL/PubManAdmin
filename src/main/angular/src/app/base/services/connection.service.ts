import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  private initial_value = environment.base_url;
  private connection = new BehaviorSubject<string>(this.initial_value);
  conn = this.connection.asObservable(); 

  constructor() { }

  setConnection(conn: string) {
    this.connection.next(conn);
  }
}
