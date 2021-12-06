import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Ctx, Ou} from 'app/base/common/model/inge';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Subscription} from 'rxjs';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {ContextsService} from '../services/contexts.service';

@Component({
  selector: 'context-list-component',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss'],
})
export class ContextListComponent implements OnInit, OnDestroy {
  ctxsUrl = environment.restCtxs;

  title: string = 'Contexts';

  ctxs: Ctx[] = [];
  ctxsByName: Ctx[] = [];
  ctxSearchTerm: string;
  selectedCtx: Ctx;

  ous: Ou[] = [];
  ouSearchTerm: string;
  selectedOu: Ou;

  pagedCtxs: Ctx[] = [];
  total: number = 1;
  pageSize: number = 50;
  currentPage: number = 1;

  loading: boolean = false;

  tokenSubscription: Subscription;
  token: string;

  constructor(
    private authenticationService: AuthenticationService,
    private contextsService: ContextsService,
    private messagesService: MessagesService,
    private organizationService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
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
    this.contextsService.getAll(this.ctxsUrl, this.token, page)
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
    this.contextsService.getAll(this.ctxsUrl, token, 1)
      .subscribe((data) => {
        this.ctxs = data.list;
        this.total = data.records;
      });
  }

  gotoCtx(ctx: Ctx) {
    this.selectedCtx = ctx;
    this.router.navigate(['/context', this.selectedCtx.objectId]);
  }

  addNewCtx() {
    this.router.navigate(['/context', 'new ctx']);
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
    this.contextsService.filter(this.ctxsUrl, null, queryString, 1)
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
    this.contextsService.filter(this.ctxsUrl, null, '?q=responsibleAffiliations.objectId:' + ou.objectId, 1)
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
