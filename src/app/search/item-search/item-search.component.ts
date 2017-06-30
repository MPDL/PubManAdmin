import { Component, OnInit, OnDestroy } from '@angular/core';
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

export const aggs = {
  creationDate: { size: 0, aggs: { name1: { date_histogram: { field: "creationDate", interval: "year", min_doc_count: 1 } } } },
  genre: { size: 0, aggs: { name1: { terms: { field: "metadata.genre", size: 100, order: { _count: "desc" } } } } },
  publisher: { size: 0, aggs: { name1: { nested: { path: "metadata.sources" }, aggs: { name2: { terms: { field: "metadata.sources.publishingInfo.publisher.sorted", size: 100 } } } } } }
}

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.scss']
})
export class ItemSearchComponent implements OnInit, OnDestroy {

  searchTerm: string;
  selectedField: string;
  fields2Select: string[] = [];
  filteredTerms: string[] = [];
  aggregationsList: any[] = [];
  selectedAggregation: any;
  years: any[] = [];
  genres: Array<any>;
  publishers: Array<any>;
  selected;
  items: any[];
  total: number;
  loading: boolean = false;
  pageSize;
  currentPage: number = 1;
  subscription: Subscription;
  token;
  index;

  constructor(private elastic: ElasticSearchService,
    private search: SearchService,
    private message: MessagesService,
    private login: AuthenticationService) { }

  get diagnostic() { return JSON.stringify(this.years); }

  ngOnInit() {

    for (let agg in aggs) {
      this.aggregationsList.push(agg);
    }

    // DOES NOT WORK !!! this.index = this.elastic.getIndex4Alias("db_items");
    this.fields2Select = this.elastic.getMappingFields("db_items", "item", "db_items_new3");

    this.subscription = this.login.token$.subscribe(token => {
      this.token = token;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  getPage(page: number, selection, term) {
        let body = { bool: { must: { match: { [selection]: term } } } };

        this.loading = true;
    this.search.listItemsByQuery(this.token, body, page)
            .do(res => {
                this.total = res.total;
                this.currentPage = page;
                this.loading = false;
            })
            .map(res => this.items = res.items);
    }

  searchItems(selection, term) {
    let body = { bool: { must: { match: { [selection]: term } } } };
    this.search.listItemsByQuery(this.token, body, 1)
      .subscribe(items => {
        this.items = items.list;
        this.total = items.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectYear(year) {
    this.search.listFilteredItems(this.token, "?q=creationDate:" + year.key + "||/y&limit=100")
      .subscribe(items => {
        this.items = items;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectGenre(genre) {
    this.search.listFilteredItems(this.token, "?q=metadata.genre:" + genre.key + "&limit=100")
      .subscribe(items => {
        this.items = items;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectPublisher(publisher) {
    let body_nested = '"{\\"nested\\":{\\"path\\":\\"metadata.sources\\",\\"query\\":{\\"bool\\":{\\"filter\\":{\\"term\\":{\\"metadata.sources.publishingInfo.publisher.sorted\\":\\"' + publisher.key + '\\"}}}}}}"';
    let body = { nested: { path: "metadata.sources", query: { bool: { filter: { term: { ["metadata.sources.publishingInfo.publisher.sorted"]: publisher.key } } } } } };
    let limit: number = Math.round(publisher.doc_count / 100);
    this.search.listItemsByQuery(this.token, body, limit)
      .subscribe(items => {
        this.items = items.list;
        this.total = items.records;
      }, err => {
        this.message.error(err);
      });
  }

  filter() {
    if (this.selectedField !== "") {
      this.filteredTerms = this.fields2Select.filter((el) => {
        return el.toLowerCase().indexOf(this.selectedField.toLowerCase()) > -1;
      });
    } else {
      this.filteredTerms = [];
    }
  }

  select(term) {
    this.selectedField = term;
    this.filteredTerms = [];
  }

  close() {
    this.selectedField = "";
    this.filteredTerms = [];
  }

  onSelect(item) {
    if (confirm("wanna delete it?")) {
      let index = this.items.indexOf(item);
      this.items.splice(index, 1);
    }
  }

}
