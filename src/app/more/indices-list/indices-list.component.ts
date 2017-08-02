import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { IndicesService } from '../indices-services/indices.service';

@Component({
  selector: 'app-indices-list',
  templateUrl: './indices-list.component.html',
  styleUrls: ['./indices-list.component.scss']
})
export class IndicesListComponent implements OnInit {

  indices: any[];

  constructor(private service: IndicesService,
      private route: ActivatedRoute,
      private router: Router) { }

  ngOnInit() {
    this.service.listAllIndices(indices => {
      this.indices = indices;
    });
  }

goTo(destination) {
      this.router.navigate(["more/list", destination]);

}

}
