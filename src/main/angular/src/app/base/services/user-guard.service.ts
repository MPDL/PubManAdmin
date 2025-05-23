import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {Observable, of, switchMap} from 'rxjs';
import {User, Ou} from '../common/model/inge';
import {BaseGuardService} from './base-guard.service';
import {AuthenticationService} from './authentication.service';
import {MessagesService} from './messages.service';
import {UsersService} from '../../users/services/users.service';
import {SearchService} from '../common/services/search.service';
import {OrganizationsService} from '../../organizations/services/organizations.service';

@Injectable({
  providedIn: 'root',
})
export class UserGuardService extends BaseGuardService {
  static instance: UserGuardService;

  constructor(
    protected authenticationService: AuthenticationService,
    protected messagesService: MessagesService,
    protected router: Router,
    private usersService: UsersService,
    private searchService: SearchService,
    private organizationsService: OrganizationsService,
  ) {
    super(authenticationService, messagesService, router);
    UserGuardService.instance = this;
  }

  protected checkAccess(route: ActivatedRouteSnapshot): Observable<boolean> {
    const userId: string = route.params['userId'];
    const topLevelOuIds = this.authenticationService.loggedInUser.topLevelOuIds;

    // First get all child OUs
    return this.organizationsService.getallChildOus(topLevelOuIds, null).pipe(
      switchMap((ous: Ou[]) => {
        // Use getListOfOusForLocalAdminFromOus with the retrieved OUs
        const queryString = `?q=${this.searchService.getListOfOusForLocalAdminFromOus(ous, 'affiliation.objectId')}`;

        // Continue with the existing logic to check users
        return this.usersService.filter(
          this.usersService.usersPath,
          queryString,
          1,
        ).pipe(
          // Rest of the method remains the same...
          switchMap((firstPageData: { list: User[], records: number }) => {
            // If user is found in first page, return true immediately
            if (firstPageData.list.some((user: User) => userId === user.objectId)) {
              return of(true);
            }

            // If only one page exists or no records, we're done
            if (firstPageData.records <= this.usersService.defaultPageSize) {
              this.denyAccess('You are not allowed to see the user with id ' + userId, '/users');
              return of(false);
            }

            // Calculate total pages needed
            const totalPages = Math.ceil(firstPageData.records / this.usersService.defaultPageSize);

            // Check pages sequentially starting from page 2
            return this.checkNextPage(userId, queryString, 2, totalPages);
          }),
        );
      })
    );
  }

// Helper method to check pages sequentially
  private checkNextPage(userId: string, queryString: string, currentPage: number, totalPages: number): Observable<boolean> {
    // If we've checked all pages and haven't found the user, deny access
    if (currentPage > totalPages) {
      this.denyAccess('You are not allowed to see the user with id ' + userId, '/users');
      return of(false);
    }

    // Check the current page
    return this.usersService.filter(
      this.usersService.usersPath,
      queryString,
      currentPage,
    ).pipe(
      switchMap((pageData: { list: User[], records: number }) => {
        // If user is found on this page, return true immediately
        if (pageData.list.some((user: User) => userId === user.objectId)) {
          return of(true);
        }

        // If user not found on this page, check the next page
        return this.checkNextPage(userId, queryString, currentPage + 1, totalPages);
      }),
    );
  }
}
