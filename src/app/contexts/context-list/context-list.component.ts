import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { PaginationComponent } from '../../base/pagination/pagination.component';

import { MessagesService } from '../../base/services/messages.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { ElasticService } from '../../base/services/elastic.service';
import { ContextsService } from '../services/contexts.service';

@Component({
  selector: 'app-context-list',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss']
})
export class ContextListComponent implements OnInit, OnDestroy {

  @ViewChild(PaginationComponent)
  private paginator: PaginationComponent;

  ctxs: any[];
  selected;
  token;
  subscription: Subscription;
  pagedCtxs: any[];

  constructor(private elastic: ElasticService,
    private ctxSvc: ContextsService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessagesService,
    private loginService: AuthenticationService) { }

  ngOnInit() {
    this.subscription = this.loginService.token$.subscribe(token => {
      this.token = token;
    });
    this.listAllContexts(this.token);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updatePaginator() {
    this.pagedCtxs = this.paginator.pagedItems;
  }

  listAllContexts(token) {
    /*
    this.elastic.listAllContextNames(names => {
      this.ctxs = names;
      this.paginator.init(1, this.ctxs);
      this.pagedCtxs = this.paginator.pagedItems;
    });
    */
    this.ctxSvc.listAllContexts(token)
      .subscribe(ctxs => {
        this.ctxs = ctxs;
        this.paginator.init(1, this.ctxs);
        this.pagedCtxs = this.paginator.pagedItems;
      });
  }

  goTo(ctx) {
    let id = ctx.reference.objectId;
    this.router.navigate(["/context", id]);
  }

  isSelected(ctx) {
    this.selected = ctx;
    return ctx.reference.objectId === this.selected.reference.objectId;
  }

  addNewContext() {
    let ctxid = "new ctx";
    this.router.navigate(['/context', ctxid]);
  }

}
