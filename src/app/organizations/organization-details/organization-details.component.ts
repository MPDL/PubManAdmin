import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { AuthenticationService } from '../../base/services/authentication.service';
import { MessagesService } from '../../base/services/messages.service';
import { OrganizationsService } from '..//services/organizations.service';
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
  alternativeName;
  description;

  subscription: Subscription;
  loginSubscription: Subscription;
  isNewOrganization: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ouSvc: OrganizationsService,
    private login: AuthenticationService,
    private message: MessagesService
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
          this.isNewOrganization = true;
          this.selected = template;
          template.reference.objectId = id;
        } else {
          this.getSelectedOu(id, this.token);
          this.listChildren(id);
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.loginSubscription.unsubscribe();
  }

  getSelectedOu(id, token) {
    this.ouSvc.getOu(id, token)
      .subscribe(ou => {
        this.selected = ou;
        if (this.selected.hasPredecessors == true) {
          let pre_id = this.selected.predecessorAffiliations[0].objectId;
          console.log("predecessor: " + pre_id);
          this.listPredecessors(pre_id, token);
        } else {
          this.predecessors = [];
        }
      }, error => {
        this.message.error(error);
      });
  }

  listPredecessors(id: string, token) {
    this.ouSvc.listFilteredOus(token, "?q=reference.objectId:" + id)
      .subscribe(ous => {
        this.predecessors = ous;
      });
  }

  listChildren(mother: string) {
    this.ouSvc.listChildren4Ou(mother, null)
      .subscribe(children => {
        this.children = children;
      });
  }

  openClose(ou) {
    this.selected = ou;
    if (this.selected.publicStatus == 'CREATED' || this.selected.state == 'CLOSED') {
      this.ouSvc.openOu(this.selected, this.token)
        .subscribe(httpStatus => {
          this.message.success("Opened " + this.selected.reference.objectId + " " + httpStatus);
        }, error => {
          this.message.error(error);
        });
    } else {
      this.ouSvc.closeOu(this.selected, this.token)
        .subscribe(httpStatus => {
          this.message.success("Closed " + this.selected.reference.objectId + " " + httpStatus);
        }, error => {
          this.message.error(error);
        });
    }
  }

  isSelected(name) {
    return true;
  }

  addName(selected) {
      if (!this.selected.defaultMetadata.alternativeNames.includes(selected)) {
        this.selected.defaultMetadata.alternativeNames.push(selected);
      }
  }

  deleteName(selected) {
    let index = this.selected.defaultMetadata.alternativeNames.indexOf(selected);
    this.selected.defaultMetadata.alternativeNames.splice(index, 1);
  }

  clearNames() {
    this.selected.defaultMetadata.alternativeNames.splice(0, this.selected.defaultMetadata.alternativeNames.length);
  }

  addDesc(selected) {
      if (!this.selected.defaultMetadata.descriptions.includes(selected)) {
        this.selected.defaultMetadata.descriptions.push(selected);
      }
  }

  deleteDesc(selected) {
    let index = this.selected.defaultMetadata.descriptions.indexOf(selected);
    this.selected.defaultMetadata.descriptions.splice(index, 1);
  }

  clearDescs() {
    this.selected.defaultMetadata.descriptions.splice(0, this.selected.defaultMetadata.descriptions.length);
  }

  save(ou) {
    this.selected = ou;
    if (this.isNewOrganization) {
      this.ouSvc.postOu(this.selected, this.token)
        .subscribe(
        data => {
          this.message.success('added new organization ' + data);
          this.gotoList();
          this.selected = null;
        },
        error => {
          this.message.error(error);
        });

    } else {
      this.message.success("updating " + this.selected.reference.objectId);
      this.ouSvc.putOu(this.selected, this.token)
        .subscribe(
        data => {
          this.message.success('updated ' + this.selected.reference.objectId + ' ' + data);
          this.gotoList();
          this.selected = null;
        },
        error => {
          this.message.error(error);
        }
        );
    }
  }

  delete(ou) {
    this.selected = ou;
    let id = this.selected.reference.objectId;
    this.ouSvc.delete(this.selected, this.token)
      .subscribe(
      data => {
        this.message.success('deleted ' + id + ' ' + data);
      }, error => {
        this.message.error(error);
      });
    this.gotoList();
  }


  showDetails(id) {
    this.router.navigate(['/organization', id]);
  }

  gotoList() {
    this.router.navigate(['/organizations']);
  }

  lists = ['childAffiliations', 'predecessorAffiliations',
    'successorAffiliations', 'parentAffiliations'];


  get diagnostic() { return JSON.stringify(this.selected); }

}
