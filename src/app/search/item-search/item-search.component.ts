import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

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
    this.elastic.itemsPerYear(items => {
      items.forEach(element => {
        let year: string = element.key_as_string;
        year = year.substring(0,4);
        let count = element.doc_count;
        let item = {doc_count: count, key: year};
        this.years.push(item);
      });;
    });
    this.elastic.genreAggregation(genres => {
      this.genres = genres;
    });
    this.elastic.publisherAggregation(publishers => {
      this.publishers = publishers;
    });
    this.subscription = this.login.token$.subscribe(token => {
      this.token = token;
    });
  }

  onSelect(list_item) {
       this.search.listFilteredItems(this.token, "?q=creationDate:"+list_item.key+"||/M&limit=100")
    .subscribe(items => {
      this.items = items;
    }, err => {
      this.message.error(err);
    });
  }
}
