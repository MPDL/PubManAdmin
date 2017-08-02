import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { IndicesService } from '../indices-services/indices.service';

@Component({
  //selector: 'app-indices-detail',
  templateUrl: './indices-detail.component.html',
  styleUrls: ['./indices-detail.component.scss']
})
export class IndicesDetailComponent implements OnInit {

  index_name;
  settings;
  mapping;
  subscription: Subscription;

  constructor(private route: ActivatedRoute,
      private router: Router,
      private service: IndicesService) { }

  ngOnInit() {
    this.subscription = this.route.params
    .subscribe(params => {
      let name = params["name"];
      this.index_name = name;
    });
    this.service.getSettings4Index(this.index_name, settings => {
      this.settings = settings;
    });
    this.service.getMapping4Index(this.index_name, "item", mapping => {
      this.mapping = mapping;
    });
  }
}
