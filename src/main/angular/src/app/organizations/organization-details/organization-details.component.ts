import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from 'environments/environment';
import {Subscription} from 'rxjs';
import {BasicRO, Identifier, Ou, OuMetadata, User, UserRO} from '../../base/common/model/inge';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {OrganizationsService} from '../services/organizations.service';

@Component({
  selector: 'organization-details-component',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.scss'],
})
export class OrganizationDetailsComponent implements OnInit, OnDestroy {
  ouRestUrl = environment.restOus;

  ou: Ou;
  ous: Ou[] = [];
  ouSearchTerm: string = '';
  isNewOu: boolean = false;

  ouIdentifierId: string;

  children: Ou[];
  predecessors: Ou[] = [];

  alternativeName: string;
  description: string;

  adminSubscription: Subscription;
  isAdmin: boolean;
  routeSubscription: Subscription;
  tokenSubscription: Subscription;
  token: string;
  userSubscription: Subscription;
  loggedInUser: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService,
    private organizationService: OrganizationsService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.userSubscription = this.authenticationService.user$.subscribe((data) => this.loggedInUser = data);

    this.routeSubscription = this.activatedRoute.params
      .subscribe(
        (data) => {
          const id = data['id'];
          if (id === 'new org') {
            this.isNewOu = true;
            this.ou = this.prepareNewOu();
          } else {
            this.getOu(id, this.token);
            this.listChildren(id);
          }
        });
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  getOu(id: string, token: string) {
    this.organizationService.get(this.ouRestUrl, id, token)
      .subscribe({
        next: (data) => {
          this.ou = data;
          if (this.ou.parentAffiliation) {
            this.ouSearchTerm = this.ou.parentAffiliation.name;
          }
          if (this.ou.hasPredecessors) {
            const preId = this.ou.predecessorAffiliations[0].objectId;
            this.listPredecessors(preId, token);
          } else {
            this.predecessors = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  listPredecessors(id: string, token: string) {
    const query = '?q=objectId:' + id;
    this.organizationService.filter(this.ouRestUrl, token, query, 1).subscribe((data) => this.predecessors = data.list);
  }

  listChildren(mother: string) {
    this.organizationService.listChildren4Ou(mother, null).subscribe((data) => this.children = data);
  }

  openOu(ou: Ou) {
    this.ou = ou;
    if (this.ou.publicStatus === 'CREATED' || this.ou.publicStatus === 'CLOSED') {
      this.organizationService.openOu(this.ou, this.token)
        .subscribe({
          next: (data) => {
            this.getOu(this.ou.objectId, this.token);
            this.messagesService.success('Opened ' + this.ou.objectId + ' ' + data);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationService.closeOu(this.ou, this.token)
        .subscribe({
          next: (data) => {
            this.getOu(this.ou.objectId, this.token);
            this.messagesService.success('Closed ' + this.ou.objectId + ' ' + data);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  addAlternativeName(selected: string) {
    if (selected != null && selected !== '') {
      if (this.ou.metadata.alternativeNames) {
        if (!this.ou.metadata.alternativeNames.includes(selected)) {
          this.ou.metadata.alternativeNames.push(selected);
        }
      } else {
        this.ou.metadata.alternativeNames = [];
        this.ou.metadata.alternativeNames.push(selected);
      }
    }

    this.alternativeName = '';
  }

  deleteAlternativeName(selected: string) {
    const index = this.ou.metadata.alternativeNames.indexOf(selected);
    this.ou.metadata.alternativeNames.splice(index, 1);
  }

  clearAlternativeNames() {
    this.ou.metadata.alternativeNames.splice(0, this.ou.metadata.alternativeNames.length);
  }

  addDescription(selected: string) {
    if (selected != null && selected !== '') {
      if (this.ou.metadata.descriptions) {
        if (!this.ou.metadata.descriptions.includes(selected)) {
          this.ou.metadata.descriptions.push(selected);
        }
      } else {
        this.ou.metadata.descriptions = [];
        this.ou.metadata.descriptions.push(selected);
      }
    }

    this.description = '';
  }

  deleteDescription(selected: string) {
    const index = this.ou.metadata.descriptions.indexOf(selected);
    this.ou.metadata.descriptions.splice(index, 1);
  }

  clearDescriptions() {
    this.ou.metadata.descriptions.splice(0, this.ou.metadata.descriptions.length);
  }

  addIdentifier(selected: string) {
    if (selected != null && selected !== '') {
      const ouid = new Identifier();
      ouid.id = selected;
      if (this.ou.metadata.identifiers) {
        if (!this.ou.metadata.identifiers.some((id) => (id.id === selected))) {
          this.ou.metadata.identifiers.push(ouid);
        }
      } else {
        this.ou.metadata.identifiers = [];
        this.ou.metadata.identifiers.push(ouid);
      }
    }
    this.ouIdentifierId = '';
  }

  deleteIdentifier(selected: Identifier) {
    const index = this.ou.metadata.identifiers.indexOf(selected);
    this.ou.metadata.identifiers.splice(index, 1);
  }

  clearIdentifiers() {
    this.ou.metadata.identifiers.splice(0, this.ou.metadata.identifiers.length);
  }

  saveOu(ou: Ou) {
    this.ou = ou;
    if (this.ou.parentAffiliation.objectId === '') {
      this.messagesService.warning('parent id MUST NOT be empty');
      return;
    }
    if (this.ou.metadata.name.includes('new ou')) {
      this.messagesService.warning('name MUST NOT be new ou');
      return;
    }
    if (this.isNewOu) {
      this.organizationService.post(this.ouRestUrl, this.ou, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('added new organization ' + this.ou.metadata.name);
            this.isNewOu = false;
            this.ou = data;
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      // this.messagesService.success('updating ' + this.selected.objectId);
      this.organizationService.put(this.ouRestUrl + '/' + this.ou.objectId, this.ou, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('updated ' + this.ou.objectId);
            this.ou = data;
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  deleteOu(ou: Ou) {
    this.ou = ou;
    const id = this.ou.objectId;
    if (confirm('delete '+ou.metadata.name+' ?')) {
      this.organizationService.delete(this.ouRestUrl + '/' + this.ou.objectId, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('deleted ' + id + ' ' + data);
            this.gotoOrganizationList();
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  showDetails(id: any) {
    this.router.navigate(['/organization', id]);
  }

  gotoOrganizationList() {
    this.router.navigate(['/organizations']);
  }

  prepareNewOu(): Ou {
    const template = new Ou();
    const creator = new UserRO();
    creator.objectId = '';
    template.creator = creator;
    const parent = new BasicRO();
    parent.objectId = '';
    template.parentAffiliation = parent;
    const meta = new OuMetadata();
    meta.name = 'new ou';
    template.metadata = meta;
    return template;
  }

  getOus(term: string) {
    if (term.length > 0 && !term.startsWith('"')) {
      this.returnSuggestedOus(term);
    } else if (term.length > 3 && term.startsWith('"') && term.endsWith('"')) {
      this.returnSuggestedOus(term);
    }
  }

  returnSuggestedOus(term: string) {
    const ous: Ou[] = [];
    const url = environment.restOus;
    const queryString = '?q=metadata.name.auto:' + term;
    this.organizationService.filter(url, null, queryString, 1)
      .subscribe({
        next: (data) => {
          data.list.forEach((ou: Ou) => {
            ous.push(ou);
          });
          if (ous.length > 0) {
            this.ous = ous;
          } else {
            this.ous = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  closeOus() {
    this.ouSearchTerm = '';
    this.ous = [];
  }

  selectOu(ou: Ou) {
    this.ouSearchTerm = ou.name;
    this.ou.parentAffiliation.objectId = ou.objectId;
    this.ous = [];
  };
}
