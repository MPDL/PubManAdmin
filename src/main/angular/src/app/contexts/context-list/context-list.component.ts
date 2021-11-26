import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

import {MessagesService} from '../../base/services/messages.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {ContextsService} from '../services/contexts.service';
import {environment} from 'environments/environment';
import {Ctx, Ou} from 'app/base/common/model/inge';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';

@Component({
  selector: 'context-list-component',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss'],
})
export class ContextListComponent implements OnInit, OnDestroy {
  url = environment.restCtxs;
  title: string = 'Contexts';
  ctxs: Ctx[] = [];
  ctxsByName: Ctx[] = [];
  ctxSearchTerm: string;
  ous: Ou[] = [];
  ouSearchTerm: string;
  selectedOu: Ou;
  selectedCtx: { objectId: any; };
  token: string;
  tokenSubscription: Subscription;
  pagedCtxs: Ctx[] = [];
  total: number = 1;
  loading: boolean = false;
  pageSize: number = 50;
  currentPage: number = 1;

  constructor(
    private contextsService: ContextsService,
    private searchService: SearchService,
    private organizationService: OrganizationsService,
    private router: Router,
    private messagesService: MessagesService,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit() {
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.listAllCtxs(this.token);
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

  listAllCtxs(token: string) {
    this.contextsService.getAll(this.url, token, 1)
      .subscribe((data) => {
        this.ctxs = data.list;
        this.total = data.records;
      });
  }

  selectCtx(ctx: { objectId: any; }) {
    const ctxId = ctx.objectId;
    this.router.navigate(['/context', ctxId]);
  }

  addNewCtx() {
    const ctxId = 'new ctx';
    this.router.navigate(['/context', ctxId]);
  }

  getCtxsByName(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedCtxs(convertedSearchTerm);
    } else {
      this.closeCtxsByName();
    }
  }

  returnSuggestedCtxs(term: string) {
    const ctxsByName: Ctx[] = [];
    const queryString = '?q=name.auto:' + term;
    this.contextsService.filter(this.url, null, queryString, 1)
      .subscribe({
        next: (data) => {
          data.list.forEach((ctx: Ctx) => ctxsByName.push(ctx));
          if (ctxsByName.length > 0) {
            this.ctxsByName = ctxsByName;
          } else {
            this.ctxsByName = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  getOus(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedOus(convertedSearchTerm);
    } else {
      this.closeOus();
    }
  }

  returnSuggestedOus(term: string) {
    const ous: Ou[] = [];
    const url = environment.restOus;
    const queryString = '?q=metadata.name.auto:' + term;
    this.organizationService.filter(url, null, queryString, 1)
      .subscribe({
        next: (data) => {
          data.list.forEach((ou: Ou) => {
            ous.push(ou);
          });
          if (ous.length > 0) {
            this.ous = ous;
          } else {
            this.ous = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  selectOu(ou: Ou) {
    this.selectedOu = ou;
    this.currentPage = 1;
    this.contextsService.filter(this.url, null, '?q=responsibleAffiliations.objectId:' + ou.objectId, 1)
      .subscribe({
        next: (data) => {
          this.ctxs = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
    this.title = 'Contexts for ' + this.selectedOu.name;
    this.closeOus();
  }

  closeCtxsByName() {
    this.ctxSearchTerm = '';
    this.ctxsByName = [];
  }

  closeOus() {
    this.ouSearchTerm = '';
    this.ous = [];
  }
}
