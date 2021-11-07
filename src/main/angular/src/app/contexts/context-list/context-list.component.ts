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
  contextSearchTerm;
  ounames: any[] = [];
  ouSearchTerm;
  selectedOUName;
  selected;
  token;
  subscription: Subscription;
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
    this.subscription = this.authenticationService.token$.subscribe((token) => this.token = token);
    this.listAllContexts(this.token);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getPage(page: number) {
    this.loading = true;
    this.contextsService.getAll(this.url, this.token, page)
      .subscribe(
        (response) => {
          this.ctxs = response.list;
          this.total = response.records;
        },
        (error) => {
          this.messagesService.error(error);
        });
    this.currentPage = page;
    this.loading = false;
  }

  listAllContexts(token) {
    this.contextsService.getAll(this.url, token, 1)
      .subscribe((ctxs) => {
        this.ctxs = ctxs.list;
        this.total = ctxs.records;
      });
  }

  goTo(ctx) {
    const ctxId = ctx.objectId;
    this.router.navigate(['/context', ctxId]);
  }

  isSelected(ctx) {
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

  returnSuggestedContexts(term) {
    const contextNames: any[] = [];
    const queryString = '?q=name.auto:' + term;
    this.contextsService.filter(this.url, null, queryString, 1)
      .subscribe(
        (response) => {
          response.list.forEach((ctx) => {
            contextNames.push(ctx);
          });
          if (contextNames.length > 0) {
            this.contextnames = contextNames;
          } else {
            this.contextnames = [];
          }
        },
        (error) => {
          this.messagesService.error(error);
        });
  }

  getOUNames(term: string) {
    const ouNames: any[] = [];
    if (term.length > 0) {
      const body = mpgOus4auto;
      body.query.bool.must.term['metadata.name.auto'] = term;
      const url = environment.rest_ous;
      this.contextsService.query(url, null, body)
        .subscribe(
          (response) => {
            response.list.forEach((ou) => {
              ouNames.push(ou);
            });
            if (ouNames.length > 0) {
              this.ounames = ouNames;
            } else {
              this.ounames = [];
            }
          },
          (error) => {
            this.messagesService.error(error);
          });
    }
  }

  filter(ou) {
    this.selectedOUName = ou;
    this.currentPage = 1;
    this.contextsService.filter(this.url, null, '?q=responsibleAffiliations.objectId:' + ou.objectId, 1)
      .subscribe(
        (response) => {
          this.ctxs = response.list;
          if (response.records > 0) {
            this.total = response.records;
          } else {
            this.messagesService.info('query did not return any results.');
          }
        },
        (error) => {
          this.messagesService.error(JSON.stringify(error));
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

  select(term) {
    this.contextSearchTerm = term.name;
    this.router.navigate(['/context', term.objectId]);
    this.contextnames = [];
  }

  delete(ctx) {
    alert('deleting ' + ctx.name + ' not yet implemented');
  }
}
