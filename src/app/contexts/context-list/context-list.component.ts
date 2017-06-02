import { Component, OnInit, ViewChild } from '@angular/core';
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
export class ContextListComponent implements OnInit {

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
    this.listAllContexts();
  }

  updatePaginator() {
    this.pagedCtxs = this.paginator.pagedItems;
  }

  listAllContexts() {
    this.elastic.listAllContextNames(names => {
      this.ctxs = names;
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

  delete(ctx) {
    this.selected = ctx;
    this.ctxSvc.delete(this.selected, this.token)
      .subscribe(
      data => {
        this.message.success('deleted ' + this.selected.reference.objectId + ' ' + data);
      },
      error => {
        this.message.error(error);
      }
      );
    this.selected = null;
    let index = this.ctxs.indexOf(ctx);
    this.ctxs.splice(index, 1);
  }
}
