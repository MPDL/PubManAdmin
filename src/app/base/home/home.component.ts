import { Component, OnInit } from '@angular/core';

import { ElasticService } from '../services/elastic.service';

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
    this.elastic.count("pure", (total) => this.items = total);
    this.elastic.count("contexts", (total) => this.contexts = total);
    this.elastic.count("ous", (total) => this.ous = total);
  }

}
