import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Elastic4ousService } from '../services/elastic4ous.service';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {

  external: boolean = false;
  current: string = "";
  currentChild = "";
  selected: any;

  mpgOus: any[];
  extOus: any[];
  children: any[];
  grandChildren: any[];
  grandGrandChildren: any[];

  constructor(
    private ouSvc: Elastic4ousService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.listOuNames4mpg("persistent13");
    this.listOuNames4ext("persistent22");
  }

  listOuNames4mpg(mother: string) {
    this.ouSvc.listOuNames("parent", mother, (names) => {
      this.mpgOus = names;
    });
  }

  get diagnostic() { return JSON.stringify(this.mpgOus) };

  listOuNames4ext(mother: string) {
    this.ouSvc.listOuNames("parent", mother, (names) => {
      this.extOus = names;

      this.extOus.sort((a, b) => {
        if (a < b) return -1;
        else if (a > b) return 1;
        else return 0;
      });
    });
  }

  getChildren(id) {
    this.current = id;
    let ou_id = id.substring(id.indexOf('_') + 1)
    this.ouSvc.listOuNames("parent", ou_id, (names) => {
      this.children = names;

      this.children.sort((a, b) => {
        if (a < b) return -1;
        else if (a > b) return 1;
        else return 0;
      });
    });
  }

  getRidOfChildren(id) {
    this.current = "";
    this.children = null;
  }

  getChildrenOfChild(id) {
    this.currentChild = id;
    let ou_id = id.substring(id.indexOf('_') + 1)
    this.ouSvc.listOuNames("parent", ou_id, (names) => {
      this.grandChildren = names;

      this.grandChildren.sort((a, b) => {
        if (a < b) return -1;
        else if (a > b) return 1;
        else return 0;
      });
    });
  }

  getRidOfChildrenOfChild(id) {
    this.currentChild = "";
    this.grandChildren = null;
  }

  addNewOrganization() {
    let id = "new org";
    this.router.navigate(['/organization', id]);
  }

  getGrandChildren(id) {
    alert("getting more 4 " + id);
  }

  onSelect(ou: any) {
    let id: string = ou.reference.objectId;
    this.router.navigate(["/organization", id]);
  }

  isSelected(ou) {
    return true;
  }

}
