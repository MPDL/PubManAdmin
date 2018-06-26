import { Component, OnInit } from '@angular/core';

import { ElasticService } from '../services/elastic.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  host: string = environment.base_url;

  constructor(private elastic: ElasticService) { }

  ngOnInit() {
  }

  theDeveloperSays() {
    alert('do ya think I\'m as stpid?');
  }

  info() {
    alert('NOT implemented yet ...');
  }

}
