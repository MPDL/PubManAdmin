import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'organization-search-component',
  templateUrl: './organization-search.component.html',
  styleUrls: ['./organization-search.component.scss'],
})

export class OrganizationSearchComponent implements OnInit {
  result;
  id;
  mems;

  constructor() {}

  ngOnInit() {}
}
