import {Component, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {environment} from 'environments/environment';
import {Subscription} from 'rxjs';
import {SearchTermComponent} from '../../base/common/components/search-term/search-term.component';
import {ctxAggs} from '../../base/common/components/search-term/search.aggregations';
import {SearchRequest, SearchTerm} from '../../base/common/components/search-term/search.term';
import {ElasticSearchService} from '../../base/common/services/elastic-search.service';
import {SearchService} from '../../base/common/services/search.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';

@Component({
  selector: 'context-search-component',
  templateUrl: './context-search.component.html',
  styleUrls: ['./context-search.component.scss'],
})
export class ContextSearchComponent implements OnInit, OnDestroy {
  @ViewChildren(SearchTermComponent)
    components: QueryList<SearchTermComponent>;

  ctxRestUrl = environment.restCtxs;

  searchForm: FormGroup;
  searchRequest: SearchRequest;

  searchTerm: string;
  selectedField: string;
  fields2Select: string[] = [];
  aggregationsList: any[] = [];
  selectedAggregation: any;
  years: any[];
  states: any[];
  selected: any;
  contexts: any[];
  total: number = 0;
  loading: boolean = false;
  currentPage: number = 1;
  tokensubscription: Subscription;
  token: string;
  index: string = 'default';

  get searchTerms(): FormArray {
    return this.searchForm.get('searchTerms') as FormArray;
  }

  constructor(
    private authenticationservice: AuthenticationService,
    private elasticSearchService: ElasticSearchService,
    private formBuilder: FormBuilder,
    private messagesService: MessagesService,
    private router: Router,
    private searchService: SearchService,
  ) {}

  ngOnInit() {
    for (const ctxAgg in ctxAggs) {
      this.aggregationsList.push(ctxAgg);
    }
    this.fields2Select = this.elasticSearchService.getMappingFields(environment.ctxIndex.name, environment.ctxIndex.type);
    this.tokensubscription = this.authenticationservice.token$.subscribe((data: string) => this.token = data);
    this.searchForm = this.formBuilder.group({
      searchTerms: this.formBuilder.array([this.initSearchTerm()]),
    });
  }

  ngOnDestroy() {
    this.tokensubscription.unsubscribe();
  }

  getPage(page: number) {
    this.searchRequest = this.prepareRequest();
    const body = this.searchService.buildQuery(this.searchRequest, 25, ((page - 1) * 25), 'name.keyword', 'asc');
    this.loading = true;
    this.searchService.query(this.ctxRestUrl, this.token, body)
      .subscribe({
        next: (data) => {
          this.total = data.records;
          this.currentPage = page;
          this.contexts = data.list;
          this.loading = false;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  handleNotification(event: string, index: number) {
    if (event === 'add') {
      this.addSearchTerm();
    } else if (event === 'remove') {
      this.removeSearchTerm(index);
    }
  }

  async onAggregationSelect(agg: string | number) {
    this.selectedAggregation = ctxAggs[agg];
    switch (agg) {
    case 'creationDate':
      this.years = await this.elasticSearchService.buckets(environment.ctxIndex.name, this.selectedAggregation, false);
      this.selected = agg;
      break;
    case 'state':
      this.states = await this.elasticSearchService.buckets(environment.ctxIndex.name, this.selectedAggregation, false);
      this.selected = agg;
      break;
    default:
      this.selected = null;
    }
  }

  onSelect(ctx: { objectId: any; }) {
    this.router.navigate(['/context', ctx.objectId]);
  }

  onSelectState(state: { key: string; }) {
    this.searchForm.reset();
    this.searchForm.controls.searchTerms.patchValue([{type: 'filter', field: 'state', searchTerm: state.key}]);
    this.currentPage = 1;
    const queryString = '?q=state:' + state.key;
    this.searchService.filter(this.ctxRestUrl, this.token, queryString, 1)
      .subscribe({
        next: (data) => {
          this.contexts = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  onSelectYear(year: { key_as_string: string; }) {
    this.searchForm.reset();
    this.searchForm.controls.searchTerms.patchValue([{type: 'filter', field: 'creationDate', searchTerm: year.key_as_string + '||/y'}]);
    this.currentPage = 1;
    const term = new SearchTerm();
    term.type = 'filter';
    term.field = 'creationDate';
    term.searchTerm = year.key_as_string+'||/y';
    const terms = [term];
    const request = new SearchRequest();
    request.searchTerms = terms;
    const body = this.searchService.buildQuery(request, 25, 0, 'creationDate', 'asc');
    this.searchService.query(this.ctxRestUrl, this.token, body)
      .subscribe({
        next: (data) => {
          this.contexts = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  submit() {
    this.searchRequest = this.prepareRequest();
    const preparedBody = this.searchService.buildQuery(this.searchRequest, 25, 0, 'name.keyword', 'asc');
    this.searchContexts(preparedBody);
  }

  private addSearchTerm() {
    this.searchTerms.push(this.initSearchTerm());
  }

  private initSearchTerm() {
    return this.formBuilder.group({
      type: 'must',
      field: '',
      searchTerm: '',
      fields: [],
    });
  }

  private prepareRequest(): SearchRequest {
    const model = this.searchForm.value;
    const searchTerms2Save: SearchTerm[] = model.searchTerms.map(
      (term: SearchTerm) => Object.assign({}, term)
    );
    const request: SearchRequest = {
      searchTerms: searchTerms2Save,
    };
    return request;
  }

  private removeSearchTerm(i: number) {
    if (i !== 0) {
      this.searchTerms.removeAt(i);
    }
  }

  private searchContexts(body: object) {
    this.currentPage = 1;
    this.searchService.query(this.ctxRestUrl, this.token, body)
      .subscribe({
        next: (data) => {
          this.contexts = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }
}
