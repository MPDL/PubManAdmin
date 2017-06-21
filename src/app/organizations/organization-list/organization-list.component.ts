import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { AuthenticationService } from '../../base/services/authentication.service';
import { MessagesService } from '../../base/services/messages.service';
import { OrganizationsService } from '../services/organizations.service';
import { Elastic4ousService } from '../services/elastic4ous.service';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit, OnDestroy {

  external: boolean = false;
  current: string = "";
  currentChild = "";
  selected: any;
  subscription: Subscription;
  token;
  mpgOus: Observable<any[]>;
  extOus: Observable<any[]>;
  children: Observable<any[]>;
  grandChildren: Observable<any[]>;
  grandGrandChildren: any[];

  constructor(
    private ouSvc: OrganizationsService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessagesService,
    private loginService: AuthenticationService
  ) { }

  ngOnInit() {
    this.subscription = this.loginService.token$.subscribe(token => {
      this.token = token;
    })
    this.listOuNames4mpg("?q=parentAffiliations.objectId:ou_persistent13", this.token);
    this.listOuNames4ext("?q=parentAffiliations.objectId:ou_persistent22", this.token);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  listOuNames4mpg(query: string, token) {
    this.mpgOus = this.ouSvc.listFilteredOus(token, query);
  }

  get diagnostic() { return JSON.stringify(this.mpgOus) };

  listOuNames4ext(query: string, token) {
    this.extOus = this.ouSvc.listFilteredOus(token, query);
  }

  getChildren(id) {
    this.current = id;
    this.children = this.ouSvc.listChildren4Ou(id, this.token);
  }

  getRidOfChildren(id) {
    this.current = "";
    this.children = null;
    if (this.currentChild.length > 0) {
      this.currentChild = "";
      this.grandChildren = null;
    }
  }

  getChildrenOfChild(id) {
    this.currentChild = id;
    this.grandChildren = this.ouSvc.listChildren4Ou(id, this.token);
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
