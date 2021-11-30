import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {MessagesService} from '../services/messages.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private messagesService: MessagesService,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            this.messagesService.error(`${err.status}, ` + err.error.message);
          } else if (err.error instanceof Object) {
            this.messagesService.error(`${err.status}, ERROR: ` + JSON.stringify(err.error));
          } else {
            this.messagesService.error(`${err.status}: ` + err.error);
          }
          return EMPTY;
        })
      );
  }
}
