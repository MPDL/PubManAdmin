import { Component, OnInit, OnDestroy, AfterViewInit, ComponentFactoryResolver, ComponentRef, QueryList, ViewContainerRef, ViewChild, ViewChildren } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

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
import { user_aggs } from '../search-term/search.aggregations';

import { props } from '../../base/common/admintool.properties';


@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent implements OnInit, OnDestroy {

  @ViewChildren(SearchTermComponent) components: QueryList<SearchTermComponent>;

  user_rest_url = props.pubman_rest_url + "/users";

  searchForm: FormGroup;
  searchRequest: SearchRequest;

  searchTerm: string;
  selectedField: string;
  fields2Select: string[] = [];
  aggregationsList: any[] = [];
  selectedAggregation: any;
  years: any[] = [];
  ous: Array<any>;
  publishers: Array<any>;
  selected;
  users: any[];
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
    private builder: FormBuilder,
    private router: Router) { }

  get diagnostic() { return JSON.stringify(this.years); }

  ngAfterViewInit() {
  }

  ngOnInit() {
    for (let agg in user_aggs) {
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
    this.selectedAggregation = user_aggs[agg];
    switch (agg) {
      case "creationDate":
        this.years = this.elastic.buckets(props.user_index_name, this.selectedAggregation, false);
        this.selected = agg;
        break;
      case "organization":
        this.ous = this.elastic.buckets(props.user_index_name, this.selectedAggregation, false);
        this.selected = agg;
        break;
      default:
        this.selected = null;
    }
  }

  getPage(page: number) {
    this.searchRequest = this.prepareRequest();
    // let body = this.search.prepareBody(this.searchRequest);
    let body = this.search.buildQuery(this.searchRequest, 25, ((page -1) * 25), "name.sorted", "asc");
    this.loading = true;
    this.search.listHitsByQuery(this.token, body, this.user_rest_url)
      .subscribe(res => {
        this.total = res.records;
        this.currentPage = page;
        this.users = res.list
        this.loading = false;
      }, (err) => {
        this.message.error(err);
      });
  }

  searchItems(body) {
    this.currentPage = 1;
    this.search.listHitsByQuery(this.token, body, this.user_rest_url)
      .subscribe(res => {
        this.users = res.list;
        this.total = res.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectYear(year) {
    this.searchForm.reset();
    this.searchForm.controls.searchTerms.patchValue([{ type: "filter", field: "creationDate", searchTerm: year.key_as_string + '||/y' }]);
    this.currentPage = 1;
    this.search.listFilteredHits(this.token, "?q=creationDate:" + year.key + "||/y", 1, props.pubman_rest_url + "/users")
      .subscribe(res => {
        this.users = res.list;
        this.total = res.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectOu(ou) {
    this.searchForm.reset();
    this.searchForm.controls.searchTerms.patchValue([{ type: "filter", field: "affiliations.title.sorted", searchTerm: ou.key }]);
    this.currentPage = 1;
    this.search.listFilteredHits(this.token, "?q=affiliations.title.sorted:" + ou.key, 1, props.pubman_rest_url + "/users")
      .subscribe(res => {
        this.users = res.list;
        this.total = res.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelect(item) {
    if (confirm("wanna edit it?")) {
      this.router.navigate(['/user', item.reference.objectId], { queryParams: { token: this.token }, skipLocationChange: true });
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
    let preparedBody = this.search.buildQuery(this.searchRequest, 25, 0, "name.sorted", "asc");
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

}
