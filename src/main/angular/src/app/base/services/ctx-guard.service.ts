import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {Observable, of, switchMap} from 'rxjs';
import {Ctx, Ou} from '../common/model/inge';
import {BaseGuardService} from './base-guard.service';
import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';
import {SearchService} from '../common/services/search.service';
import {ContextsService} from '../../contexts/services/contexts.service';
import {OrganizationsService} from '../../organizations/services/organizations.service';

@Injectable({
  providedIn: 'root',
})
export class CtxGuardService extends BaseGuardService {
  static instance: CtxGuardService;

  constructor(
    protected override authenticationService: AuthenticationService,
    protected override messagesService: MessagesService,
    protected override router: Router,
    private searchService: SearchService,
    private organizationsService: OrganizationsService,
    private contextsService: ContextsService
  ) {
    super(authenticationService, messagesService, router);
    CtxGuardService.instance = this;
  }
  protected checkAccess(route: ActivatedRouteSnapshot): Observable<boolean> {
    const ctxId: string = route.params['ctxId'];

    if (ctxId === 'new ctx') return of(true);

    const topLevelOuIds = this.authenticationService.loggedInUser.topLevelOuIds;

    // First get all child OUs
    return this.organizationsService.getallChildOus(topLevelOuIds, null).pipe(
      switchMap((ous: Ou[]) => {
        // Use getListOfOusForLocalAdminFromOus with the retrieved OUs
        const queryString = `?q=${this.searchService.getListOfOusForLocalAdminFromOus(ous, 'responsibleAffiliations.objectId')}`;

        // Continue with the existing logic to check contexts
        return this.contextsService.filter(
          this.contextsService.ctxsPath,
          queryString,
          1,
        ).pipe(
          switchMap((firstPageData: { list: Ctx[], records: number }) => {
            // If context is found in first page, return true immediately
            if (firstPageData.list.some((ctx: Ctx) => ctxId === ctx.objectId)) {
              return of(true);
            }

            // If only one page exists or no records, we're done
            if (firstPageData.records <= this.contextsService.defaultPageSize) {
              this.denyAccess('You are not allowed to see the context with id ' + ctxId, '/contexts');
              return of(false);
            }

            // Calculate total pages needed
            const totalPages = Math.ceil(firstPageData.records / this.contextsService.defaultPageSize);

            // Check pages sequentially starting from page 2
            return this.checkNextPage(ctxId, queryString, 2, totalPages);
          }),
        );
      })
    );
  }

// Helper method to check pages sequentially
  private checkNextPage(ctxId: string, queryString: string, currentPage: number, totalPages: number): Observable<boolean> {
    // If we've checked all pages and haven't found the context, deny access
    if (currentPage > totalPages) {
      this.denyAccess('You are not allowed to see the context with id ' + ctxId, '/contexts');
      return of(false);
    }

    // Check the current page
    return this.contextsService.filter(
      this.contextsService.ctxsPath,
      queryString,
      currentPage,
    ).pipe(
      switchMap((pageData: { list: Ctx[], records: number }) => {
        // If context is found on this page, return true immediately
        if (pageData.list.some((ctx: Ctx) => ctxId === ctx.objectId)) {
          return of(true);
        }

        // If context not found on this page, check the next page
        return this.checkNextPage(ctxId, queryString, currentPage + 1, totalPages);
      }),
    );
  }
}
