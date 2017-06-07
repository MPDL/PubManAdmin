import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { ContextsService } from './contexts.service';
import { template } from '../context-details/context.template';

@Injectable()
export class ContextDetailsResolverService implements Resolve<any> {

  constructor(private ctxSvc: ContextsService,
      private router: Router) { }

      resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        let id = route.params['id'];
        if (id == 'new ctx') {
            let ctx = template;
            ctx.name = "new ctx";
            return Observable.of(ctx);
        } else {
            let token = route.params['token'];
        return this.ctxSvc.getContext(id, token).first(); // add first() to ensure observable completion 
        }
      }

}

