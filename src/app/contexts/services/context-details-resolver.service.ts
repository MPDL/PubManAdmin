import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { ContextsService } from './contexts.service';
import { MessagesService } from '../../base/services/messages.service';
import { Context } from '../../base/common/model';
import { props } from '../../base/common/admintool.properties';

@Injectable()
export class ContextDetailsResolverService implements Resolve<any> {

    constructor(
        private ctxSvc: ContextsService,
        private message: MessagesService,
        private router: Router) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Context> {
        let id = route.params['id'];
        if (id == 'new ctx') {
            let ctx = new Context();
            ctx.name = "new ctx";
            ctx.responsibleAffiliations = [];
            ctx.allowedGenres = [];
            ctx.allowedSubjectClassifications = [];
            ctx.workflow = "SIMPLE";
            return Observable.of(ctx);
        } else {
            let token = route.params['token'];
            return this.ctxSvc.get(props.pubman_rest_url_ctxs, id, token)
                .first()
                .catch((err, obs) => {
                    this.message.error(err);
                    return Observable.throw(err);
                }); // add first() to ensure observable completion 
        }
    }

}

