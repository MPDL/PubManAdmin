import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {User} from 'app/base/common/model/inge';
import {environment} from 'environments/environment';
import {Subscription} from 'rxjs';
import {SearchTermComponent} from '../../base/common/components/search-term/search-term.component';
import {userAggs} from '../../base/common/components/search-term/search.aggregations';
import {SearchRequest, SearchTerm} from '../../base/common/components/search-term/search.term';
import {ElasticSearchService} from '../../base/common/services/elastic-search.service';
import {SearchService} from '../../base/common/services/search.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';

@Component({
  selector: 'user-search-component',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss'],
})
export class UserSearchComponent implements OnInit {
  @ViewChildren(SearchTermComponent)
    components: QueryList<SearchTermComponent>;

  url = environment.restUsers;
  searchForm: FormGroup;
  searchRequest: SearchRequest;

  searchTerm: string;
  selectedField: string;
  fields2Select: string[] = [];
  aggregationsList: any[] = [];
  selectedAggregation: any;
  years: any[];
  ous: any[];
  selected: string;
  users: User[];
  total: number = 0;
  loading: boolean = false;
  currentPage: number = 1;
  token: string;
  tokenSubscription: Subscription;

  get searchTerms(): FormArray {
    return this.searchForm.get('searchTerms') as FormArray;
  }

  constructor(
    private authenticationService: AuthenticationService,
    private elasticSearchService: ElasticSearchService,
    private formBuilder: FormBuilder,
    private messagesService: MessagesService,
    private router: Router,
    private searchService: SearchService,
  ) {}

  ngOnInit() {
    for (const userAgg in userAggs) {
      this.aggregationsList.push(userAgg);
    }
    this.fields2Select = this.elasticSearchService.getMappingFields(environment.userIndex.name, environment.userIndex.type);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data: string) => this.token = data);
    this.searchForm = this.formBuilder.group({
      searchTerms: this.formBuilder.array([this.initSearchTerm()]),
    });
  }

  ngOnDestroy() {
    this.tokenSubscription.unsubscribe();
  }

  getPage(page: number) {
    this.searchRequest = this.prepareRequest();
    const body = this.searchService.buildQuery(this.searchRequest, 25, ((page - 1) * 25), 'name.keyword', 'asc');
    this.loading = true;
    this.searchService.query(this.url, this.token, body)
      .subscribe({
        next: (data: {list: User[], records: number}) => {
          this.total = data.records;
          this.currentPage = page;
          this.users = data.list;
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
    this.selectedAggregation = userAggs[agg];
    switch (agg) {
    case 'creationDate':
      this.years = await this.elasticSearchService.buckets(environment.userIndex.name, this.selectedAggregation, false);
      this.selected = agg;
      break;
    case 'organization':
      this.ous = await this.elasticSearchService.buckets(environment.userIndex.name, this.selectedAggregation, false);
      this.selected = agg;
      break;
    default:
      this.selected = null;
    }
  }

  onSelect(item: { objectId: any; }) {
    this.router.navigate(['/user', item.objectId]);
  }

  onSelectOu(ou: { key: any; }) {
    this.searchForm.reset();
    this.searchForm.controls.searchTerms.patchValue([{type: 'filter', field: 'affiliation.name.keyword', searchTerm: ou.key}]);
    this.currentPage = 1;
    const body = {
      'size': 25, 'query': {'bool': {'filter': {'term': {'affiliation.name.keyword': ou.key}}}}, 'sort': [
        {'name.keyword': {'order': 'asc'}},
      ],
    };
    this.searchService.query(this.url, this.token, body)
      .subscribe({
        next: (data: {list: User[], records: number}) => {
          this.users = data.list;
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
    term.searchTerm = year.key_as_string + '||/y';
    const terms = [term];
    const request = new SearchRequest();
    request.searchTerms = terms;
    const body = this.searchService.buildQuery(request, 25, 0, 'creationDate', 'asc');
    this.searchService.query(this.url, this.token, body)
      .subscribe({
        next: (data: {list: User[], records: number}) => {
          this.users = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  submit() {
    this.searchRequest = this.prepareRequest();
    const preparedBody = this.searchService.buildQuery(this.searchRequest, 25, 0, 'name.keyword', 'asc');
    this.searchUsers(preparedBody);
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

  private searchUsers(body: object) {
    this.currentPage = 1;
    this.searchService.query(this.url, this.token, body)
      .subscribe({
        next: (data: {list: User[], records: number}) => {
          this.users = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }
}
