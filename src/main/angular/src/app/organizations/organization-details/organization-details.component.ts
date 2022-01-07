import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from 'environments/environment';
import {Subscription} from 'rxjs';
import {Identifier, Ou, User} from '../../base/common/model/inge';
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
  isNewOu: boolean = false;

  parentOus: Ou[] = [];
  parentOuSearchTerm: string = '';
  isNewParentOu: boolean = false;
  parentOuId: string;

  children: Ou[];
  hasOpenChildren: boolean;
  predecessors: Ou[] = [];

  alternativeName: string;
  description: string;
  identifier: string;

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
    private organizationsService: OrganizationsService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
    this.routeSubscription = this.activatedRoute.params
      .subscribe(
        (data) => {
          const id = data['id'];
          this.hasOpenChildren = false;
          if (id === 'new org') {
            this.isNewOu = true;
            this.isNewParentOu = true;
            this.ou = this.prepareNewOu();
          } else {
            this.getOu(id, this.token);
            this.listChildren(id);
          }
        });
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.userSubscription = this.authenticationService.user$.subscribe((data) => this.loggedInUser = data);
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  private prepareNewOu(): Ou {
    const ou = new Ou();
    ou.parentAffiliation = this.organizationsService.makeAffiliation('');
    ou.metadata = this.organizationsService.makeMetadata('new ou');
    return ou;
  }

  private getOu(id: string, token: string) {
    this.organizationsService.get(this.ouRestUrl, id, token)
      .subscribe({
        next: (data) => {
          this.ou = data;
          if (this.ou.parentAffiliation != null && this.ou.parentAffiliation.objectId != '') {
            this.parentOuSearchTerm = this.ou.parentAffiliation.name;
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

  private listPredecessors(id: string, token: string) {
    const query = '?q=objectId:' + id;
    this.organizationsService.filter(this.ouRestUrl, token, query, 1).subscribe((data) => this.predecessors = data.list);
  }

  private listChildren(mother: string) {
    this.organizationsService.listChildren4Ou(mother, null)
      .subscribe({
        next: (data) => {
          this.children = data;
          this.children.forEach((child) => {
            if (child.publicStatus === 'OPENED') {
              this.hasOpenChildren = true;
            }
          });
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  openOu(ou: Ou) {
    this.ou = ou;
    if (this.ou.publicStatus === 'CREATED' || this.ou.publicStatus === 'CLOSED') {
      this.organizationsService.openOu(this.ou, this.token)
        .subscribe({
          next: (data) => {
            this.ou = data;
            this.messagesService.success('Opened ' + this.ou.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.closeOu(this.ou, this.token)
        .subscribe({
          next: (data) => {
            this.ou = data;
            this.messagesService.success('Closed ' + this.ou.objectId);
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
    if (confirm('remove all subject alternative names ?')) {
      this.ou.metadata.alternativeNames.splice(0, this.ou.metadata.alternativeNames.length);
    }
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
    if (confirm('remove all descriptions ?')) {
      this.ou.metadata.descriptions.splice(0, this.ou.metadata.descriptions.length);
    }
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
    this.identifier = '';
  }

  deleteIdentifier(selected: Identifier) {
    const index = this.ou.metadata.identifiers.indexOf(selected);
    this.ou.metadata.identifiers.splice(index, 1);
  }

  clearIdentifiers() {
    if (confirm('remove all identificators ?')) {
      this.ou.metadata.identifiers.splice(0, this.ou.metadata.identifiers.length);
    }
  }

  saveOu(ou: Ou) {
    this.ou = ou;

    if (this.ou.metadata.name.includes('new ou')) {
      this.messagesService.warning('name MUST NOT be new ou');
      return;
    }

    if (this.ou.metadata.name == null) {
      this.messagesService.warning('name MUST NOT be empty');
      return;
    }

    if (this.isNewParentOu && this.ou.parentAffiliation.objectId === '' && !this.isAdmin) {
      this.messagesService.warning('you MUST select an organization');
      return;
    }

    if (this.ou.parentAffiliation != null && this.ou.parentAffiliation.objectId === '') {
      this.ou.parentAffiliation = null;
    }

    if (this.isNewOu) {
      this.organizationsService.post(this.ouRestUrl, this.ou, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('added new organization ' + this.ou.metadata.name);
            this.isNewOu = false;
            this.isNewParentOu = false;
            this.ou = data;
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.put(this.ouRestUrl + '/' + this.ou.objectId, this.ou, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('updated organization ' + this.ou.objectId);
            this.isNewParentOu = false;
            this.ou = data;
            if (this.ou.parentAffiliation != null && this.ou.parentAffiliation.objectId != '') {
              this.parentOuSearchTerm = this.ou.parentAffiliation.name;
            }
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  deleteOu(ou: Ou) {
    this.ou = ou;
    const id = this.ou.objectId;
    if (confirm('delete '+ou.metadata.name+' ?')) {
      this.organizationsService.delete(this.ouRestUrl + '/' + this.ou.objectId, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('deleted organization ' + id);
            this.gotoOrganizationList();
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  gotoRef(id: any) {
    this.router.navigate(['/organization', id]);
  }

  gotoOrganizationList() {
    this.router.navigate(['/organizations']);
  }

  getParentOus(term: string) {
    if (term.length > 0 && !term.startsWith('"')) {
      this.returnSuggestedParentOus(term);
    } else if (term.length > 3 && term.startsWith('"') && term.endsWith('"')) {
      this.returnSuggestedParentOus(term);
    }
  }

  private returnSuggestedParentOus(term: string) {
    const ous: Ou[] = [];
    const url = environment.restOus;
    const queryString = '?q=metadata.name.auto:' + term;
    this.organizationsService.filter(url, null, queryString, 1)
      .subscribe({
        next: (data) => {
          data.list.forEach((ou: Ou) => {
            ous.push(ou);
          });
          if (ous.length > 0) {
            this.parentOus = ous;
          } else {
            this.parentOus = [];
          }
          this.ou.parentAffiliation.objectId = '';
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  closeParentOus() {
    this.parentOuSearchTerm = '';
    this.parentOus = [];
  }

  selectParentOu(ou: Ou) {
    this.parentOuSearchTerm = ou.name;
    this.ou.parentAffiliation.objectId = ou.objectId;
    this.parentOus = [];
  };

  changeParentOu() {
    this.isNewParentOu = true;
    this.closeParentOus();
    this.ou.parentAffiliation = this.organizationsService.makeAffiliation('');
  }

  clearParentOuSearchTerm() {
    this.parentOuSearchTerm = '';
  }
}
