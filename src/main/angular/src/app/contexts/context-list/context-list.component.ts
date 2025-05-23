import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Ctx, Ou} from 'app/base/common/model/inge';
import {ctxs4autoSelectByName, ous4autoSelect} from 'app/base/common/model/query-bodies';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {ContextsService} from '../services/contexts.service';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import {ClickOutsideDirective} from '../../base/directives/clickoutside.directive';

@Component({
  selector: 'context-list-component',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ClickOutsideDirective,
  ],
  providers: [ContextsService],
})
export class ContextListComponent implements OnInit {
  ctxsPath: string = environment.restCtxs;
  ousPath: string = environment.restOus;

  title: string = 'Contexts';
  dummyOu: string = 'ou_unselected';

  ctxs: Ctx[] = [];
  ctxsByName: Ctx[] = [];
  ctxSearchTerm: string;
  selectedCtx: Ctx;

  ous: Ou[] = [];
  ouSearchTerm: string;
  selectedOu: Ou;

  total: number = 1;
  pageSize: number = 50;
  currentPage: number = 1;

  loading: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private contextsService: ContextsService,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
  ) {
  }

  ngOnInit() {
    const ouId: string = this.activatedRoute.snapshot.params['ouId'];
    const page: string = this.activatedRoute.snapshot.params['page'];

    if (page != null) {
      this.currentPage = +page;
    } else {
      this.currentPage = 1;
    }

    if (ouId != null && ouId !== this.dummyOu) {
      this.organizationsService.get(this.ousPath, ouId)
        .subscribe({
          next: (data: Ou) => {
            this.selectOu(data);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else if (page != null) {
      this.getPage(this.currentPage);
    } else if (this.authenticationService.isAdmin) {
      this.listAllCtxs(this.currentPage);
    } else {
      this.organizationsService.getallChildOus(this.authenticationService.loggedInUser.topLevelOuIds, null)
        .subscribe({
          next: (data: Ou[]) => {
            this.listCtxs(this.searchService.getListOfOusForLocalAdminFromOus(data, 'responsibleAffiliations.objectId'), this.currentPage);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  addNewCtx() {
    this.router.navigate(['/context', 'new ctx']);
  }

  closeCtxsByName() {
    this.ctxSearchTerm = '';
    this.ctxsByName = [];
  }

  closeOus() {
    this.ouSearchTerm = '';
    this.ous = [];
  }

  getCtxsByName(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedCtxsByName(convertedSearchTerm);
    } else {
      this.closeCtxsByName();
    }
  }

  getOus(ouName: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(ouName);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedOus(convertedSearchTerm);
    } else {
      this.closeOus();
    }
  }

  gotoCtx(ctx: Ctx) {
    this.selectedCtx = ctx;
    this.router.navigate(['/context', this.selectedCtx.objectId]);
  }

  gotoFilteredOu(ou: Ou) {
    this.currentPage = 1;
    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };
    this.router.navigate(['/contexts', ou.objectId, this.currentPage]);
  }

  gotoFilteredPage(page: number) {
    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };
    this.router.navigate(['/contexts', this.selectedOu != null ? this.selectedOu.objectId : this.dummyOu, page]);
  }

  private getPage(page: number) {
    this.loading = true;
    if (this.selectedOu === undefined) {
      if (this.authenticationService.isAdmin) {
        this.listAllCtxs(page);
      } else {
        this.organizationsService.getallChildOus(this.authenticationService.loggedInUser.topLevelOuIds, null)
          .subscribe({
            next: (data: Ou[]) => this.listCtxs(this.searchService.getListOfOusForLocalAdminFromOus(data, 'responsibleAffiliations.objectId'), page),
            error: (e) => this.messagesService.error(e),
          });
      }
    } else {
      this.listCtxs(this.selectedOu.objectId, page);
    }
    this.loading = false;
  }

  private listAllCtxs(page: number) {
    this.contextsService.getAll(this.ctxsPath, page)
      .subscribe({
        next: (data: { list: Ctx[], records: number }) => {
          this.ctxs = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private listCtxs(listOfOuIds: string, page: number) {
    const queryString = '?q=' + listOfOuIds;
    this.contextsService.filter(this.ctxsPath, queryString, page)
      .subscribe({
        next: (data: { list: Ctx[], records: number }) => {
          this.ctxs = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private returnSuggestedCtxsByName(ctxName: string) {
    if (this.authenticationService.isAdmin) {
      const queryString = '?q=name.auto:' + ctxName;
      this.contextsService.filter(this.ctxsPath, queryString, 1)
        .subscribe({
          next: (data: { list: Ctx[], records: number }) => this.ctxsByName = data.list,
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.getallChildOus(this.authenticationService.loggedInUser.topLevelOuIds, null)
        .subscribe({
          next: (data: Ou[]) => {
            const allOuIds: string[] = [];
            data.forEach(
              (ou: Ou) => allOuIds.push(ou.objectId),
            );
            const body = ctxs4autoSelectByName;
            body.query.bool.filter.terms['responsibleAffiliations.objectId'] = allOuIds;
            body.query.bool.must.term['name.auto'] = ctxName.toLowerCase();
            this.contextsService.query(this.ctxsPath, body)
              .subscribe({
                next: (data: { list: Ctx[], records: number }) => this.ctxsByName = data.list,
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  private returnSuggestedOus(ouName: string) {
    if (this.authenticationService.isAdmin) {
      const queryString = '?q=metadata.name.auto:' + ouName;
      this.organizationsService.filter(this.ousPath, queryString, 1)
        .subscribe({
          next: (data: { list: Ou[], records: number }) => this.ous = data.list,
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.getallChildOus(this.authenticationService.loggedInUser.topLevelOuIds, null)
        .subscribe({
          next: (data: Ou[]) => {
            const allOuIds: string[] = [];
            data.forEach(
              (ou: Ou) => allOuIds.push(ou.objectId),
            );
            const body = ous4autoSelect;
            body.query.bool.filter.terms['objectId'] = allOuIds;
            body.query.bool.must.term['metadata.name.auto'] = ouName.toLowerCase();
            this.organizationsService.query(this.ousPath, body)
              .subscribe({
                next: (data: { list: Ou[], records: number }) => this.ous = data.list,
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  private selectOu(ou: Ou) {
    this.selectedOu = ou;
    const queryString = '?q=responsibleAffiliations.objectId:' + ou.objectId;
    this.contextsService.filter(this.ctxsPath, queryString, this.currentPage)
      .subscribe({
        next: (data: { list: Ctx[], records: number }) => {
          this.ctxs = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
    this.title = 'Contexts for ' + this.selectedOu.name;
    this.closeOus();
  }
}
