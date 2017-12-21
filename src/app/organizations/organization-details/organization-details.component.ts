import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { AuthenticationService } from '../../base/services/authentication.service';
import { MessagesService } from '../../base/services/messages.service';
import { OrganizationsService } from '../services/organizations.service';
import { OU, Identifier, RO, OUMetadata } from '../../base/common/model';
import { props } from '../../base/common/admintool.properties';

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.scss']
})
export class OrganizationDetailsComponent implements OnInit, OnDestroy {

  token: string;
  selected: OU;
  children: OU[];
  predecessors: OU[] = [];
  alternativeName;
  description;
  ouIdentifierId;

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
        });
        let id = params['id'];
        if (id == 'new org') {
          this.isNewOrganization = true;
          this.selected = this.prepareNewOU(id);

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
    this.ouSvc.get(props.pubman_rest_url_ous, id, token)
      .subscribe(ou => {
        this.selected = ou;
        if (this.selected.hasPredecessors == true) {
          let pre_id = this.selected.predecessorAffiliations[0].objectId;
          this.listPredecessors(pre_id, token);
        } else {
          this.predecessors = [];
        }
      }, error => {
        this.message.error(error);
      });
  }

  listPredecessors(id: string, token) {
    let query = "?q=reference.objectId:" + id;
    this.ouSvc.filter(props.pubman_rest_url_ous, token, query, 1)
      .subscribe(ous => {
        this.predecessors = ous.list;
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
    if (this.selected.publicStatus == 'CREATED' || this.selected.publicStatus == 'CLOSED') {
      this.ouSvc.openOu(this.selected, this.token)
        .subscribe(httpStatus => {
          this.getSelectedOu(this.selected.reference.objectId, this.token);
          this.message.success("Opened " + this.selected.reference.objectId + " " + httpStatus);
        }, error => {
          this.message.error(error);
        });
    } else {
      this.ouSvc.closeOu(this.selected, this.token)
        .subscribe(httpStatus => {
          this.getSelectedOu(this.selected.reference.objectId, this.token);
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

    if (selected != null && selected !== "") {

      if (this.selected.defaultMetadata.alternativeNames) {
        if (!this.selected.defaultMetadata.alternativeNames.includes(selected)) {
          this.selected.defaultMetadata.alternativeNames.push(selected);
        }
      } else {
        this.selected.defaultMetadata.alternativeNames = [];
        this.selected.defaultMetadata.alternativeNames.push(selected);
      }
    }

    this.alternativeName = "";
  }

  deleteName(selected) {
    let index = this.selected.defaultMetadata.alternativeNames.indexOf(selected);
    this.selected.defaultMetadata.alternativeNames.splice(index, 1);
  }

  clearNames() {
    this.selected.defaultMetadata.alternativeNames.splice(0, this.selected.defaultMetadata.alternativeNames.length);
  }

  addDesc(selected) {
    if (selected != null && selected !== "") {

      if (this.selected.defaultMetadata.descriptions) {
        if (!this.selected.defaultMetadata.descriptions.includes(selected)) {
          this.selected.defaultMetadata.descriptions.push(selected);
        }
      } else {
        this.selected.defaultMetadata.descriptions = [];
        this.selected.defaultMetadata.descriptions.push(selected);
      }
    }

    this.description = "";
  }

  deleteDesc(selected) {
    let index = this.selected.defaultMetadata.descriptions.indexOf(selected);
    this.selected.defaultMetadata.descriptions.splice(index, 1);
  }

  clearDescs() {
    this.selected.defaultMetadata.descriptions.splice(0, this.selected.defaultMetadata.descriptions.length);
  }

  addIdentifier(selected) {
    if (selected != null && selected !== "") {

      let ouid = new Identifier();
      ouid.id = selected;
      if (this.selected.defaultMetadata.identifiers) {
        if (!this.selected.defaultMetadata.identifiers.some(id => (id.id == selected))) {
          this.selected.defaultMetadata.identifiers.push(ouid);
        }
      } else {
        this.selected.defaultMetadata.identifiers = [];
        this.selected.defaultMetadata.identifiers.push(ouid);
      }
    }
    this.ouIdentifierId = "";
  }

  deleteIdentifier(selected) {
    let index = this.selected.defaultMetadata.identifiers.indexOf(selected);
    this.selected.defaultMetadata.identifiers.splice(index, 1);
  }

  clearIdentifiers() {
    this.selected.defaultMetadata.identifiers.splice(0, this.selected.defaultMetadata.identifiers.length);
  }

  save(ou) {
    this.selected = ou;
    if (this.selected.parentAffiliations[0].objectId === "") {
      this.message.warning("parent id MUST NOT be empty");
      return;
    }
    if (this.selected.defaultMetadata.name.includes("new ou")) {
      this.message.warning("name MUST NOT be new ou");
      return;
    }
    if (this.isNewOrganization) {
      this.ouSvc.post(props.pubman_rest_url_ous, this.selected, this.token)
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
      this.ouSvc.put(props.pubman_rest_url_ous + "/" + this.selected.reference.objectId, this.selected, this.token)
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
    this.ouSvc.delete(props.pubman_rest_url_ous + "/" + this.selected.reference.objectId, this.selected, this.token)
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

  prepareNewOU(id): OU {
    let template = new OU();
    let ref = new RO();
    ref.objectId = "";
    template.reference = ref;
    let creator = new RO();
    creator.objectId = "";
    template.creator = creator;
    let parent = new RO();
    parent.objectId = "";
    let parents = [];
    parents.push(parent);
    template.parentAffiliations = parents;
    let meta = new OUMetadata();
    meta.name = "new ou";
    template.defaultMetadata = meta;
    template.publicStatus = "";
    return template;

  }

}
