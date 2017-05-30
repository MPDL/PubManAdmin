import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { AuthenticationService } from '../../base/services/authentication.service';
import { Elastic4ousService } from '..//services/elastic4ous.service';
import { template } from './organization.template';
import { User } from '../../base/common/model';


@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.scss']
})
export class OrganizationDetailsComponent implements OnInit, OnDestroy {

  token: string;
  user: User;
  selected: any;
  children: any[];
  predecessors: any[] = [];

  subscription: Subscription;
  loginSubscription: Subscription;
  isNewOrganization: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private elastic: Elastic4ousService,
    private login: AuthenticationService
  ) { }

  ngOnInit() {
    this.subscription = this.route.params
      .subscribe(params => {
        this.loginSubscription = this.login.token$.subscribe(token => {
          this.token = token;
          this.login.who(this.token).subscribe(user => {
            this.user = user;
          });
        });
        let id = params['id'];
        if (id == 'new org') {
          this.selected = template;
          template.reference.objectId = "pure_newest_org";
          template.creator.objectId = "pure_org_admin";
          template.modifiedBy.objectId = "pure_org_admin";
        } else {
          id = id.substring(id.indexOf('_') + 1);
          this.getSelectedOu(id);
          this.listChildren(id);
        }

      });
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }

  getSelectedOu(id) {
    this.elastic.searchOu(id, (list) => {
      this.selected = list[0];
      if (this.selected.hasPredecessors == true) {
        let pre_id = this.selected.predecessorAffiliations[0].objectId;
        console.log("predecessor: " + pre_id);
        this.listPredecessors(pre_id);
      } else {
        this.predecessors = [];
      }
    });
  }

  listPredecessors(id: string) {
    this.elastic.listOuNames("predecessor", id, (names) => {
      this.predecessors = names;
    });
  }

  listChildren(mother: string) {
    this.elastic.listOuNames("parent", mother, (names) => {
      this.children = names;

      this.children.sort((a, b) => {
        if (a < b) return -1;
        else if (a > b) return 1;
        else return 0;
      });
    });
  }

  openClose(ou) {
    this.selected = ou;
    if (this.selected.publicStatus == 'opened') {
      this.selected.publicStatus = 'closed';
    } else {
      this.selected.publicStatus = 'opened';
    }
  }

  deleteChild(ou) {
    let index = this.children.indexOf(ou);
    this.children.splice(index, 1);
  }

  save(ou) {
    // alert("not yet implemented!");
    ou.lastModificationDate = new Date();
    ou.modifiedBy.objectId = this.user.exid;
    this.elastic.updateOu(ou);
  }

  showDetails(id) {
    this.router.navigate(['/organization', id]);
  }

  gotoList() {
    //let ouid = this.ou ? this.ou.referece.objectId : null;
    this.router.navigate(['/organizations', { id: this.selected.reference.objectId }]);
  }

  lists = ['childAffiliations', 'predecessorAffiliations',
    'successorAffiliations', 'parentAffiliations'];


  get diagnostic() { return JSON.stringify(this.selected); }

}
