import { Component, OnInit } from '@angular/core';

import { ElasticService } from '../services/elastic.service';
import { props } from '../common/admintool.properties';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  items: number;
  contexts: number;
  ous: number;

  constructor(private elastic: ElasticService) { }

  ngOnInit() {
    this.elastic.count(props.item_index_name, (total) => this.items = total);
    this.elastic.count(props.ctx_index_name, (total) => this.contexts = total);
    this.elastic.count(props.ou_index_name, (total) => this.ous = total);
  }

}
