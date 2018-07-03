import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { PaginationComponent } from '../../base/pagination/pagination.component';

import { MessagesService } from '../../base/services/messages.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { ContextsService } from '../services/contexts.service';
import { Elastic4contextsService } from '../services/elastic4contexts.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-context-list',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss']
})
export class ContextListComponent implements OnInit, OnDestroy {

  @ViewChild(PaginationComponent)
  private paginator: PaginationComponent;
  url = environment.rest_url + environment.rest_contexts;
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
    this.ctxSvc.getAll(this.url, this.token, page)
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
    this.ctxSvc.getAll(this.url, this.token, 1)
      .subscribe(ctxs => {
        this.ctxs = ctxs.list;
        this.total = ctxs.records;
      });
  }

  goTo(ctx) {
    const id = ctx.objectId;
    this.router.navigate(['/context', id]);
  }

  isSelected(ctx) {
    this.selected = ctx;
    return ctx.objectId === this.selected.objectId;
  }

  addNewContext() {
    const ctxid = 'new ctx';
    this.router.navigate(['/context', ctxid]);
  }

  getContextNames(a) {
    const contextNames: any[] = [];
    this.elastic.contexts4auto(a, (names) => {
      names.forEach(name => contextNames.push(name));
      if (contextNames.length > 0) {
        this.contextnames = contextNames;
      } else {
        this.contextnames = [];
      }
    });
  }

  getOUNames(a: string) {
    if (a.includes('\'')) {
      this.message.warning('NO QUOTES!!!')
    } else {
      let body = {
        "query": {
          "bool": {
            "filter": {
              "term": {
                "parentAffiliation.objectId": "ou_persistent13"
              }
            },
            "must": {
              "term": {
                "metadata.name.auto": a
              }
            }
          }
        }
      };

      const ouNames: any[] = [];
      this.elastic.ous4auto(body, (names) => {
        names.forEach(name => ouNames.push(name));
        if (ouNames.length > 0) {
          this.ounames = ouNames;
        } else {
          this.ounames = [];
        }
      });
    }
  }

  filter(ou) {
    this.selectedOUName = ou;
    this.currentPage = 1;
    this.ctxSvc.filter(this.url, null, '?q=responsibleAffiliations.objectId:' + ou.objectId, 1)
      .subscribe(res => {
        this.ctxs = res.list;
        if (res.records > 0) {
          this.total = res.records;
        } else {
          this.message.info('query did not return any results.')
        }
      }, err => {
        this.message.error(JSON.stringify(err));
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
