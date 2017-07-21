import { Component, OnInit, OnDestroy, AfterViewInit, ComponentFactoryResolver, ComponentRef, QueryList, ViewContainerRef, ViewChild, ViewChildren } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';

import { Subscription } from 'rxjs/Subscription';
import * as bodyBuilder from 'bodybuilder';

import { MessagesService } from '../../base/services/messages.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { ElasticSearchService } from '../services/elastic-search.service';
import { SearchService } from '../services/search.service';
import { SearchTermComponent } from '../search-term/search-term.component';
import { SearchRequest, SearchTerm } from '../search-term/search.term';
import { props } from '../../base/common/admintool.properties';

export const aggs = {
  select: {},
  creationDate: { size: 0, aggs: { name1: { date_histogram: { field: "creationDate", interval: "year", min_doc_count: 1 } } } },
  organization: { size: 0, aggs: { name1: { terms: { field: "affiliations.title.sorted", size: 100, order: { _count: "desc" } } } } },
}

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent implements OnInit {

  @ViewChildren(SearchTermComponent) components: QueryList<SearchTermComponent>;

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
  pageSize: number = 25;
  currentPage: number = 1;
  subscription: Subscription;
  token;
  index: string = "default";

  constructor(private elastic: ElasticSearchService,
    private search: SearchService,
    private message: MessagesService,
    private login: AuthenticationService,
    private builder: FormBuilder) { }

  get diagnostic() { return JSON.stringify(this.years); }

  ngAfterViewInit() {
  }

  ngOnInit() {
    for (let agg in aggs) {
      this.aggregationsList.push(agg);
    }
    this.fields2Select = this.elastic.getMappingFields(props.user_index_name, props.user_index_type);
    this.subscription = this.login.token$.subscribe(token => {
      this.token = token;
    });
    this.searchForm = this.builder.group({
      searchTerms: this.builder.array([this.initSearchTerm()])
    });
  }

  get searchTerms(): FormArray {
    return this.searchForm.get('searchTerms') as FormArray;
  }

  initSearchTerm() {
    return this.builder.group({
      type: "",
      field: "",
      searchTerm: "",
      fields: []
    });
  }

  addSearchTerm() {
    this.searchTerms.push(this.initSearchTerm());
  }

  removeSearchTerm(i: number) {
    this.searchTerms.removeAt(i);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onAggregationSelect(agg) {
    this.selectedAggregation = aggs[agg];
    switch (agg) {
      case "creationDate":
        this.years = this.elastic.buckets(props.user_index_name, this.selectedAggregation, false);
        this.selected = agg;
        break;
      case "organization":
        this.genres = this.elastic.buckets(props.user_index_name, this.selectedAggregation, false);
        this.selected = agg;
        break;
      default:
        this.selected = null;
    }
  }

  getPage(page: number) {
    this.searchRequest = this.prepareRequest();
    let body = this.prepareBody(this.searchRequest);
    console.log(JSON.stringify(body))
    this.loading = true;
    let field, term;
    Object.keys(body.bool.filter[0].term).forEach((k) => {
      field = k;
      term = body.bool.filter[0].term[k];
    })

    this.search.listFilteredUsers(this.token, "?q=" + field + ":" + term, page, props.pubman_rest_url + "/users")
      .subscribe(items => {
        this.items = items;
        this.total = 100;
        this.currentPage = page;
        this.loading = false;
      }, err => {
        this.message.error(err);
      });
  }

  searchItems(body) {
    this.currentPage = 1;
    this.search.listItemsByQuery(this.token, body, 1)
      .subscribe(items => {
        this.items = items.list;
        this.total = items.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectYear(year) {
    this.searchForm.reset();
    this.searchForm.controls.searchTerms.patchValue([{ type: "filter", field: "creationDate", searchTerm: year.key_as_string + '||/y' }]);
    this.currentPage = 1;
    this.search.listFilteredUsers(this.token, "?q=creationDate:" + year.key + "||/y", 1, props.pubman_rest_url + "/users")
      .subscribe(items => {
        this.items = items;
        this.total = year.doc_count;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectGenre(genre) {
    this.searchForm.reset();
    this.searchForm.controls.searchTerms.patchValue([{ type: "filter", field: "affiliations.title.sorted", searchTerm: genre.key }]);
    this.currentPage = 1;
    this.search.listFilteredUsers(this.token, "?q=affiliations.title.sorted:" + genre.key, 1, props.pubman_rest_url + "/users")
      .subscribe(items => {
        this.items = items;
        this.total = genre.doc_count;
      }, err => {
        this.message.error(err);
      });
  }

  onSelect(item) {
    if (confirm("wanna delete it?")) {
      let index = this.items.indexOf(item);
      this.items.splice(index, 1);
    }
  }

  handleNotification(event: string, index) {
    if (event === "add") {
      this.addSearchTerm();
    } else if (event === "remove") {
      this.removeSearchTerm(index);
    }
  }

  submit() {
    this.searchRequest = this.prepareRequest();
    let preparedBody = this.prepareBody(this.searchRequest);
    this.searchItems(preparedBody);
  }

  prepareRequest(): SearchRequest {
    const model = this.searchForm.value;
    const searchTerms2Save: SearchTerm[] = model.searchTerms.map(
      (term: SearchTerm) => Object.assign({}, term)
    );
    const request: SearchRequest = {
      searchTerms: searchTerms2Save
    };
    return request;
  }

  prepareBody(request): any {
    let must, must_not, filter, should;
    request.searchTerms.forEach(element => {
      let field = element.field;
      let value: string = element.searchTerm;
      switch (element.type) {
        case "must":
          if (must) {
            must.push({ match: { [field]: value } });
          } else {
            must = [{ match: { [field]: value } }];
          }
          break;
        case "must_not":
          if (must_not) {
            must_not.push({ term: { [field]: value } });
          } else {
            must_not = [{ term: { [field]: value } }];
          }
          break;
        case "filter":
          if (filter) {
            filter.push({ term: { [field]: value } });
          } else {
            filter = [{ term: { [field]: value } }];
          }
          break;
        case "should":
          if (should) {
            should.push({ term: { [field]: value } });
          } else {
            should = [{ term: { [field]: value } }];
          }
          break;
        default:
      }
    });
    const body = { bool: { must, must_not, filter, should } };
    // confirm("BODY: " + JSON.stringify(body));
    return body;
  }


}
