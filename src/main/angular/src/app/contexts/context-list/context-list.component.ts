import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

import {MessagesService} from '../../base/services/messages.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {ContextsService} from '../services/contexts.service';
import {environment} from 'environments/environment';
import {mpgOus4auto} from '../../base/common/model/query-bodies';

@Component({
  selector: 'context-list-component',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss'],
})
export class ContextListComponent implements OnInit, OnDestroy {
  url = environment.rest_contexts;
  title: string = 'Contexts';
  ctxs: any[];
  contextnames: any[] = [];
  contextSearchTerm: string;
  ounames: any[] = [];
  ouSearchTerm: string;
  selectedOUName;
  selected: { objectId: any; };
  token: string;
  tokenSubscription: Subscription;
  pagedCtxs: any[];
  total: number = 1;
  loading: boolean = false;
  pageSize: number = 50;
  currentPage: number = 1;

  constructor(
    private contextsService: ContextsService,
    private router: Router,
    private messagesService: MessagesService,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit() {
    this.tokenSubscription = this.authenticationService.token$.subscribe((token) => this.token = token);
    this.listAllContexts(this.token);
  }

  ngOnDestroy() {
    this.tokenSubscription.unsubscribe();
  }

  getPage(page: number) {
    this.loading = true;
    this.contextsService.getAll(this.url, this.token, page)
      .subscribe({
        next: (data) => {
          this.ctxs = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
    this.currentPage = page;
    this.loading = false;
  }

  listAllContexts(token: string) {
    this.contextsService.getAll(this.url, token, 1)
      .subscribe((data) => {
        this.ctxs = data.list;
        this.total = data.records;
      });
  }

  goTo(ctx: { objectId: any; }) {
    const ctxId = ctx.objectId;
    this.router.navigate(['/context', ctxId]);
  }

  isSelected(ctx: { objectId: any; }) {
    this.selected = ctx;
    return ctx.objectId === this.selected.objectId;
  }

  addNewContext() {
    const ctxId = 'new ctx';
    this.router.navigate(['/context', ctxId]);
  }

  getContextNames(term: string) {
    if (term.length > 0 && !term.startsWith('"')) {
      this.returnSuggestedContexts(term);
    } else if (term.length > 3 && term.startsWith('"') && term.endsWith('"')) {
      this.returnSuggestedContexts(term);
    }
  }

  returnSuggestedContexts(term: string) {
    const contextNames: any[] = [];
    const queryString = '?q=name.auto:' + term;
    this.contextsService.filter(this.url, null, queryString, 1)
      .subscribe({
        next: (data) => {
          data.list.forEach((ctx) => contextNames.push(ctx));
          if (contextNames.length > 0) {
            this.contextnames = contextNames;
          } else {
            this.contextnames = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  getOUNames(term: string) {
    const ouNames: any[] = [];
    if (term.length > 0) {
      const body = mpgOus4auto;
      body.query.bool.must.term['metadata.name.auto'] = term;
      const url = environment.rest_ous;
      this.contextsService.query(url, null, body)
        .subscribe({
          next: (data) => {
            data.list.forEach((ou: any) => ouNames.push(ou));
            if (ouNames.length > 0) {
              this.ounames = ouNames;
            } else {
              this.ounames = [];
            }
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  filter(ou: { objectId: string; }) {
    this.selectedOUName = ou;
    this.currentPage = 1;
    this.contextsService.filter(this.url, null, '?q=responsibleAffiliations.objectId:' + ou.objectId, 1)
      .subscribe({
        next: (data) => {
          this.ctxs = data.list;
          if (data.records > 0) {
            this.total = data.records;
          } else {
            this.messagesService.info('query did not return any results.');
          }
        },
        error: (e) => this.messagesService.error(e),
      });
    this.title = 'Contexts for ' + this.selectedOUName.name;
    this.closeOUNames();
  }

  close() {
    this.contextSearchTerm = '';
    this.contextnames = [];
  }

  closeOUNames() {
    this.ouSearchTerm = '';
    this.ounames = [];
  }

  select(term: { name: any; objectId: any; }) {
    this.contextSearchTerm = term.name;
    this.router.navigate(['/context', term.objectId]);
    this.contextnames = [];
  }

  delete(ctx: { name: string; }) {
    alert('deleting ' + ctx.name + ' not yet implemented');
  }
}
