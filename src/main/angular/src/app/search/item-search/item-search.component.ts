import {Component, OnInit, OnDestroy, QueryList, ViewChildren} from '@angular/core';
import {FormGroup, FormArray, FormBuilder} from '@angular/forms';

import {Subscription} from 'rxjs';

import {MessagesService} from '../../base/services/messages.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {ElasticSearchService} from '../../base/common/services/elastic-search.service';
import {SearchService} from '../../base/common/services/search.service';
import {SearchTermComponent} from '../../base/common/components/search-term/search-term.component';
import {SearchRequest, SearchTerm} from '../../base/common/components/search-term/search.term';
import {itemAggs} from '../../base/common/components/search-term/search.aggregations';

import {environment} from 'environments/environment';

@Component({
  selector: 'item-search-component',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.scss'],
})
export class ItemSearchComponent implements OnInit, OnDestroy {
  @ViewChildren(SearchTermComponent)
    components: QueryList<SearchTermComponent>;

  item_rest_url = environment.restItems;

  searchForm: FormGroup;
  searchRequest: SearchRequest;

  searchTerm: string;
  selectedField: string;
  fields2Select: string[] = [];
  aggregationsList: any[] = [];
  selectedAggregation: any;
  years: any[] = [];
  genres: Array<any>;
  publishers: Array<any>;
  selected;
  items: any[];
  total: number = 0;
  loading: boolean = false;
  currentPage: number = 1;
  tokensubscription: Subscription;
  token;
  index: string = 'default';

  constructor(
    private elasticSearchService: ElasticSearchService,
    private searchService: SearchService,
    private messagesService: MessagesService,
    private authenticationservice: AuthenticationService,
    private formBuilder: FormBuilder
  ) {}

  get diagnostic() {
    return JSON.stringify(this.years);
  }

  ngOnInit() {
    for (const itemAgg in itemAggs) {
      this.aggregationsList.push(itemAgg);
    }
    this.fields2Select = this.elasticSearchService.getMappingFields(environment.itemIndex.name, environment.itemIndex.type);
    this.tokensubscription = this.authenticationservice.token$.subscribe((data) => this.token = data);
    this.searchForm = this.formBuilder.group({
      searchTerms: this.formBuilder.array([this.initSearchTerm()]),
    });
  }

  get searchTerms(): FormArray {
    return this.searchForm.get('searchTerms') as FormArray;
  }

  initSearchTerm() {
    return this.formBuilder.group({
      type: '',
      field: '',
      searchTerm: '',
      fields: [],
    });
  }

  addSearchTerm() {
    this.searchTerms.push(this.initSearchTerm());
  }

  removeSearchTerm(i: number) {
    this.searchTerms.removeAt(i);
  }

  ngOnDestroy() {
    this.tokensubscription.unsubscribe();
  }

  onAggregationSelect(agg) {
    this.selectedAggregation = itemAggs[agg];
    switch (agg) {
    case 'creationDate':
      this.years = this.elasticSearchService.buckets(environment.itemIndex.name, this.selectedAggregation, false);
      this.selected = agg;
      break;
    case 'genre':
      this.genres = this.elasticSearchService.buckets(environment.itemIndex.name, this.selectedAggregation, false);
      this.selected = agg;
      break;
    case 'publisher':
      this.publishers = this.elasticSearchService.buckets(environment.itemIndex.name, this.selectedAggregation, true);
      this.selected = agg;
      break;
    default:
      this.selected = null;
    }
  }

  getPage(page: number) {
    this.searchRequest = this.prepareRequest();
    const body = this.searchService.buildQuery(this.searchRequest, 25, ((page - 1) * 25), 'metadata.title.keyword', 'asc');
    this.loading = true;
    this.searchService.query(this.item_rest_url, this.token, body)
      .subscribe({
        next: (data) => {
          this.total = data.records;
          this.currentPage = page;
          this.items = data.list;
          this.loading = false;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  searchItems(body) {
    this.currentPage = 1;
    this.searchService.query(this.item_rest_url, this.token, body)
      .subscribe({
        next: (data) => {
          this.items = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  onSelectYear(year) {
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
    this.searchService.query(this.item_rest_url, this.token, body)
      .subscribe({
        next: (data) => {
          this.items = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  onSelectGenre(genre) {
    this.searchForm.reset();
    this.searchForm.controls.searchTerms.patchValue([{type: 'filter', field: 'metadata.genre', searchTerm: genre.key}]);
    this.currentPage = 1;
    this.searchService.filter(this.item_rest_url, this.token, '?q=metadata.genre:' + genre.key, 1)
      .subscribe({
        next: (data) => {
          this.items = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  onSelectPublisher(publisher) {
    this.searchForm.reset();
    const body = {size: 25, from: 0,
      query: {nested: {path: 'metadata.sources',
        query: {bool: {filter: {term: {['metadata.sources.publishingInfo.publisher.keyword']: publisher.key}}}}}}};
    this.searchForm.controls.searchTerms.patchValue([{type: 'filter',
      field: 'metadata.sources.publishingInfo.publisher.keyword', searchTerm: publisher.key}]);
    this.currentPage = 1;
    this.searchService.query(this.item_rest_url, this.token, body)
      .subscribe({
        next: (data) => {
          this.items = data.list;
          this.total = data.records;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  onSelect(item) {
    if (confirm('wanna delete it?')) {
      const index = this.items.indexOf(item);
      this.items.splice(index, 1);
    }
  }

  handleNotification(event: string, index) {
    if (event === 'add') {
      this.addSearchTerm();
    } else if (event === 'remove') {
      this.removeSearchTerm(index);
    }
  }

  submit() {
    this.searchRequest = this.prepareRequest();
    const preparedBody = this.searchService.buildQuery(this.searchRequest, 25, 0, 'metadata.title.keyword', 'asc');
    this.searchItems(preparedBody);
  }

  prepareRequest(): SearchRequest {
    const model = this.searchForm.value;
    const searchTerms2Save: SearchTerm[] = model.searchTerms.map(
      (term: SearchTerm) => Object.assign({}, term)
    );
    const request: SearchRequest = {
      searchTerms: searchTerms2Save,
    };
    return request;
  }
}
