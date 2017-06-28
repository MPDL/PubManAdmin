import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as bodyBuilder from 'bodybuilder';

import { MessagesService } from '../../base/services/messages.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { ElasticSearchService } from '../services/elastic-search.service';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.scss']
})
export class ItemSearchComponent implements OnInit {

  years: Array<any> = [];
  genres: Array<any>;
  publishers: Array<any>;
  selected;
  items: any[];
  subscription: Subscription;
  token;

  constructor(private elastic: ElasticSearchService,
    private search: SearchService,
    private message: MessagesService,
    private login: AuthenticationService) { }

  get diagnostic() { return JSON.stringify(this.years); }

  ngOnInit() {
  
    let datebody = {size:0, aggs : {name1 : {date_histogram : {field : "metadata.anyDates", interval : "year", min_doc_count: 1}}}};
    this.elastic.bucketAggregation("db_items", datebody, false, buckets => {
      this.years = buckets;
    });

    let genrebody =  {size:0, aggs : {name1 : {terms : {field : "metadata.genre", size : 10, order : { _count : "desc" }}}}};
    this.elastic.bucketAggregation("db_items", genrebody, false, buckets => {
      this.genres = buckets;
    });

   let publisherbody = {size:0, aggs : {name1 : {nested : {path : "metadata.sources" }, aggs : { name2 : { terms : { field : "metadata.sources.publishingInfo.publisher.sorted", size : 10 }}}}}};
   this.elastic.bucketAggregation("db_items", publisherbody, true, buckets => {
      this.publishers = buckets;
    });
    this.subscription = this.login.token$.subscribe(token => {
      this.token = token;
    });
  }

  someMethod() {
  }

  onSelectYear(year) {
    this.search.listFilteredItems(this.token, "?q=metadata.anyDates:"+year.key_as_string+"||/y&limit=100")
    .subscribe(items => {
      this.items = items;
    }, err => {
      this.message.error(err);
    });
  }

  onSelectGenre(genre) {
    this.search.listFilteredItems(this.token, "?q=metadata.genre:"+genre.key+"&limit=100")
    .subscribe(items => {
      this.items = items;
    }, err => {
      this.message.error(err);
    });
  }

  onSelectPublisher(publisher) {
    let body_nested = '"{\\"nested\\":{\\"path\\":\\"metadata.sources\\",\\"query\\":{\\"bool\\":{\\"filter\\":{\\"term\\":{\\"metadata.sources.publishingInfo.publisher.sorted\\":\\"' + publisher.key + '\\"}}}}}}"';
    let body_string = '"{\\"bool\\":{\\"must\\":{\\"match\\":{\\"metadata.title\\":\\"genome\\"}}}}"';
    let limit: number = Math.round(publisher.doc_count / 100);
    alert("passing limit :" + limit)
    this.search.listItemsByNestedQuery(this.token, body_nested, limit)
    .subscribe(items => {
      this.items = items;
    }, err => {
      this.message.error(err);
    });
  }
}
