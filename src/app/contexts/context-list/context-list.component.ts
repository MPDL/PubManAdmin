import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { PaginationComponent } from '../../base/pagination/pagination.component';

import { MessagesService } from '../../base/services/messages.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { ContextsService } from '../services/contexts.service';
import { Elastic4contextsService } from '../services/elastic4contexts.service';
import { props } from '../../base/common/admintool.properties';


@Component({
  selector: 'app-context-list',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss']
})
export class ContextListComponent implements OnInit, OnDestroy {

  @ViewChild(PaginationComponent)
  private paginator: PaginationComponent;

  ctxs: any[];
  contextnames: any[] = [];
  contextSearchTerm;
  selected;
  token;
  subscription: Subscription;
  pagedCtxs: any[];
  total: number = 1;
  loading: boolean = false;
  pageSize: number = 25;
  currentPage: number = 1;

  
  constructor(private ctxSvc: ContextsService,
    private elastic: Elastic4contextsService,
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

  getPage(page: number) {
    this.loading = true;
    this.ctxSvc.getAll(props.pubman_rest_url_ctxs, this.token, page)
      .subscribe(result => {
        this.ctxs = result.list;
        this.total = result.records;
      }, (err) => {
        this.message.error(err);
      });
    this.currentPage = page;
    this.loading = false;

  }

  updatePaginator() {
    this.pagedCtxs = this.paginator.pagedItems;
  }

  listAllContexts(token) {
    this.ctxSvc.getAll(props.pubman_rest_url_ctxs, this.token, 1)
      .subscribe(ctxs => {
        this.ctxs = ctxs.list;
        this.total = ctxs.records;
      });
  }

  goTo(ctx) {
    let id = ctx.objectId;
    this.router.navigate(["/context", id]);
  }

  isSelected(ctx) {
    this.selected = ctx;
    return ctx.objectId === this.selected.objectId;
  }

  addNewContext() {
    let ctxid = "new ctx";
    this.router.navigate(['/context', ctxid]);
  }

  getContextNames(a) {
    let contextNames: any[] = [];
    this.elastic.contexts4auto(a, (names) => {
      names.forEach(name => contextNames.push(name));
      if (contextNames.length > 0) {
        this.contextnames = contextNames;
      } else {
        this.contextnames = [];
      }
    });
  }

  close() {
    this.contextSearchTerm = "";
    this.contextnames = [];
  }

  select(term) {
    this.contextSearchTerm = term.name;
    this.router.navigate(['/context', term.objectId]);
    this.contextnames = [];
  }
}
