import { Injectable } from '@angular/core';
import {
    HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/retry';

import { MessagesService } from '../services/messages.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

    constructor(
        private messages: MessagesService
      ) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
            .catch((err: HttpErrorResponse) => {

                if (err.error instanceof Error) {
                    this.messages.error(`${err.status}, ` + err.error.message);
                } else {
                    this.messages.error(`${err.status}, ERROR: ${err.error}`);
                }
                return Observable.empty<HttpEvent<any>>();
            });
    }
}