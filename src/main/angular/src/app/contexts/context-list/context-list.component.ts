import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Ctx, Ou, User} from 'app/base/common/model/inge';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {UsersService} from 'app/users/services/users.service';
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
  ctxsPath: string = environment.restCtxs;
  ousPath: string = environment.restOus;

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

  adminSubscription: Subscription;
  isAdmin: boolean;
  tokenSubscription: Subscription;
  token: string;
  userSubscription: Subscription;
  loggedInUser: User;

  constructor(
    private authenticationService: AuthenticationService,
    private contextsService: ContextsService,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
    private usersService: UsersService,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.userSubscription = this.authenticationService.user$.subscribe((data) => this.loggedInUser = data);

    if (this.token != null) {
      if (this.isAdmin) {
        this.listAllCtxs(1);
      } else if (this.loggedInUser != null) {
        this.listCtxs(this.usersService.getListOfOusForLocalAdmin(this.loggedInUser.grantList, 'responsibleAffiliations.objectId'), 1);
      }
    } else {
      this.messagesService.warning('no token, no contexts!');
    }
  }

  ngOnDestroy() {
    this.tokenSubscription.unsubscribe();
  }

  listAllCtxs(page: number) {
    this.contextsService.getAll(this.ctxsPath, this.token, page)
      .subscribe((data) => {
        this.ctxs = data.list;
        this.total = data.records;
      });
  }

  private listCtxs(searchTerm: string, page: number) {
    this.contextsService.filter(this.ctxsPath, null, '?q=' + searchTerm, page)
      .subscribe({
        next: (data) => {
          this.ctxs = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  getPage(page: number) {
    this.loading = true;
    if (this.selectedOu === undefined) {
      if (this.isAdmin) {
        this.listAllCtxs(page);
      } else if (this.loggedInUser != null) {
        this.listCtxs(this.usersService.getListOfOusForLocalAdmin(this.loggedInUser.grantList, 'responsibleAffiliations.objectId'), page);
      }
    } else {
      this.listCtxs(this.selectedOu.objectId, page);
    }
    this.currentPage = page;
    this.loading = false;
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

  private returnSuggestedCtxs(term: string) {
    const ctxsByName: Ctx[] = [];
    const queryString = '?q=name.auto:' + term;
    this.contextsService.filter(this.ctxsPath, null, queryString, 1)
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

  private returnSuggestedOus(term: string) {
    const ous: Ou[] = [];
    const queryString = '?q=metadata.name.auto:' + term;
    this.organizationsService.filter(this.ousPath, null, queryString, 1)
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
    this.contextsService.filter(this.ctxsPath, null, '?q=responsibleAffiliations.objectId:' + ou.objectId, 1)
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
