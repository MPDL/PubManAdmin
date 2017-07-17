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
import { SearchRequest, SearchTerm } from './search.term';

export const aggs = {
  select: {},
  creationDate: { size: 0, aggs: { name1: { date_histogram: { field: "creationDate", interval: "year", min_doc_count: 1 } } } },
  genre: { size: 0, aggs: { name1: { terms: { field: "metadata.genre", size: 100, order: { _count: "desc" } } } } },
  publisher: { size: 0, aggs: { name1: { nested: { path: "metadata.sources" }, aggs: { name2: { terms: { field: "metadata.sources.publishingInfo.publisher.sorted", size: 100 } } } } } }
}

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.scss'],
})
export class ItemSearchComponent implements OnInit, OnDestroy, AfterViewInit {

  /*
  @ViewChild("searchTermContainer", { read: ViewContainerRef }) container;
  component: ComponentRef<SearchTermComponent>;
  */
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
  index;

  constructor(private elastic: ElasticSearchService,
    private search: SearchService,
    private message: MessagesService,
    private login: AuthenticationService,
    private cfr: ComponentFactoryResolver,
    private vcf: ViewContainerRef,
    private builder: FormBuilder) { }

  get diagnostic() { return JSON.stringify(this.years); }

  /*
    addSearchTerm() {
      // this.container.clear();
      const factory = this.cfr.resolveComponentFactory(SearchTermComponent);
      // const ref = this.vcf.createComponent(factory);
      this.component = this.container.createComponent(factory);
      this.component.instance.fields2Select = this.fields2Select;
      this.component.instance.selectedFieldChange.subscribe(event => this.selectedField = event);
      this.component.instance.searchTermChange.subscribe(event => this.searchTerm = event);
      this.component.instance.notice.subscribe(event => this.triggerAddRemove(event));
    }
  
    removeSearchTerm() {
    }
  
    triggerAddRemove(event) {
      if (event.startsWith("add")) {
        this.addSearchTerm();
      } else {
        confirm("do ya really wanna remove me?");
        this.component.destroy();
      }
    }
    */

  ngAfterViewInit() {

  }

  ngOnInit() {

    for (let agg in aggs) {
      this.aggregationsList.push(agg);
    }

    // DOES NOT WORK !!! this.index = this.elastic.getIndex4Alias("db_items");
    this.fields2Select = this.elastic.getMappingFields("db_items", "item", "db_items_new3");

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
    // this.component.destroy();
  }

  onAggregationSelect(agg) {
    this.selectedAggregation = aggs[agg];
    switch (agg) {
      case "creationDate":
        this.years = this.elastic.buckets("db_items", this.selectedAggregation, false);
        this.selected = agg;
        break;
      case "genre":
        this.genres = this.elastic.buckets("db_items", this.selectedAggregation, false);
        this.selected = agg;
        break;
      case "publisher":
        this.publishers = this.elastic.buckets("db_items", this.selectedAggregation, true);
        this.selected = agg;
        break;
      default:
        this.selected = null;
    }
  }

  getPage(page: number) {
    this.selectedField = this.components.first.searchTermForm.get("field").value;
    this.searchTerm = this.components.first.searchTermForm.get("searchTerm").value;
    let body = { bool: { must: { match: { [this.selectedField]: this.searchTerm } } } };
    /*
    if (page > 400) {
      page = 400;
    }
    */
    this.loading = true;
    this.search.listItemsByQuery(this.token, body, page)
      .subscribe(res => {
        this.total = res.records;
        this.currentPage = page;
        this.items = res.list
        this.loading = false;
      }, (err) => {
        this.message.error(err);
      });
  }

  searchItems(body) {
    // let body = { bool: { must: { match: { [selection]: term } } } };
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
    this.searchForm.controls.searchTerms.patchValue([{ field: "creationDate", searchTerm: year.key_as_string + '||/y' }]);
    this.currentPage = 1;
    this.search.listFilteredItems(this.token, "?q=creationDate:" + year.key + "||/y", 1)
      .subscribe(items => {
        this.items = items.list;
        this.total = items.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectGenre(genre) {
    // this.selectedField = "metadata.genre";
    // this.searchTerm = genre.key;
    this.searchForm.controls.searchTerms.patchValue([{ field: "metadata.genre", searchTerm: genre.key }]);
    this.currentPage = 1;
    this.search.listFilteredItems(this.token, "?q=metadata.genre:" + genre.key, 1)
      .subscribe(items => {
        this.items = items.list;
        this.total = items.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectPublisher(publisher) {
    let body_nested = '"{\\"nested\\":{\\"path\\":\\"metadata.sources\\",\\"query\\":{\\"bool\\":{\\"filter\\":{\\"term\\":{\\"metadata.sources.publishingInfo.publisher.sorted\\":\\"' + publisher.key + '\\"}}}}}}"';
    let body = { nested: { path: "metadata.sources", query: { bool: { filter: { term: { ["metadata.sources.publishingInfo.publisher.sorted"]: publisher.key } } } } } };
    // this.selectedField = "metadata.sources.publishingInfo.publisher.sorted";
    // this.searchTerm = publisher.key;
    this.searchForm.controls.searchTerms.patchValue([{ field: "metadata.sources.publishingInfo.publisher.sorted", searchTerm: publisher.key }]);
    this.currentPage = 1;
    this.search.listItemsByQuery(this.token, body, 1)
      .subscribe(items => {
        this.items = items.list;
        this.total = items.records;
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
    } else {
      let f = event.split(":")[0];
      let t = event.split(":")[1];
      let body = { bool: { must: { match: { [f]: t } } } };
      this.searchItems(body);
    }
  }

  submit() {
    this.searchRequest = this.prepareRequest();
    let preparedBody = this.prepareBody(this.searchRequest);
    let f = this.searchRequest.searchTerms[0].field;
    let t = this.searchRequest.searchTerms[0].searchTerm;
    let body = { bool: { must: { match: { [f]: t } } } };
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
            // let match = {match:must.match};
            console.log(JSON.stringify(must));
            // must = [match, {match: { [field]: value }}];
            must.push({match: { [field]: value }});
          } else {
            must = [{ match: { [field]: value } }];
          }
          break;
        case "must_not":
          must_not = [{ term: { [field]: value } }];
          break;
        case "filter":
          filter = [{ term: { [field]: value } }];
          break;
        case "should":
          should = [{ term: { [field]: value } }];
          break;
        default:
      }
    });
          const body = { bool: { must, must_not, filter, should }};
      confirm("BODY: " + JSON.stringify(body));
    return body;
  }

}
