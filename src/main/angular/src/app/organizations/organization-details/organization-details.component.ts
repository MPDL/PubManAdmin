import {Location} from '@angular/common';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {SearchService} from 'app/base/common/services/search.service';
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
  @ViewChild('form')
    form: NgForm;

  ousPath: string = environment.restOus;

  isNewOu: boolean = false;
  ou: Ou;
  ousForLoggedInUser: Ou[];

  parentOuId: string;
  parentOuSearchTerm: string = '';
  parentOus: Ou[] = [];

  children: Ou[];
  hasOpenChildren: boolean;
  hasOpenParent: boolean;

  isNewPredecessor: boolean = false;
  predecessorOu: Ou;
  predecessors: Ou[] = [];
  predecessorOuSearchTerm: string = '';
  predecessorOus: Ou[] = [];

  alternativeName: string;
  description: string;
  identifier: string;

  adminSubscription: Subscription;
  isAdmin: boolean;
  tokenSubscription: Subscription;
  token: string;
  userSubscription: Subscription;
  loggedInUser: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private location: Location,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data: boolean) => this.isAdmin = data);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data: string) => this.token = data);
    this.userSubscription = this.authenticationService.loggedInUser$.subscribe((data: User) => this.loggedInUser = data);

    this.setOu(this.activatedRoute.snapshot.data['ou']);
    this.hasOpenChildren = false;
    this.hasOpenParent = true;

    if (!this.isAdmin) {
      this.getLoggedInUserAllOpenOus(null);
    }

    if (this.ou.metadata.name === 'new ou') {
      this.ou.metadata.name = null;
      this.isNewOu = true;
    }
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  private setOu(ou: Ou) {
    this.ou = ou;
    if (this.ou.parentAffiliation != null && this.ou.parentAffiliation.objectId !== '') {
      this.parentOuSearchTerm = this.ou.parentAffiliation.name;
      let parentOu:Ou;
      this.organizationsService.get(this.ousPath, this.ou.parentAffiliation.objectId, this.token)
        .subscribe({
          next: (data: Ou) => {
            parentOu = data;
            if (parentOu.publicStatus === 'CLOSED') {
              this.hasOpenParent = false;
            }
          },
          error: (e) => this.messagesService.error(e),
        });
    }
    if (this.ou.hasPredecessors) {
      const predecessorIds: string[] = [];
      this.ou.predecessorAffiliations.forEach((predecessor: Ou) => {
        predecessorIds.push(predecessor.objectId);
      });
      this.listPredecessors(this.searchService.getListOfIds(predecessorIds, 'objectId'), this.token);
    } else {
      this.predecessors = [];
    }
    this.listChildren(this.ou.objectId);
  }

  private listPredecessors(listOfPredecessorIds: string, token: string) {
    const queryString = '?q=' + listOfPredecessorIds;
    this.organizationsService.filter(this.ousPath, token, queryString, 1)
      .subscribe({
        next: (data: {list: Ou[], records: number}) => this.predecessors = data.list,
        error: (e) => this.messagesService.error(e),
      });
  }

  private listChildren(mother: string) {
    this.organizationsService.listChildren4Ou(mother, null)
      .subscribe({
        next: (data: Ou[]) => {
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

  changeOuState() {
    if (this.ou.publicStatus === 'CREATED' || this.ou.publicStatus === 'CLOSED') {
      this.organizationsService.openOu(this.ou, this.token)
        .subscribe({
          next: (data: Ou) => {
            this.ou = data;
            this.messagesService.success('opened ' + this.ou.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.closeOu(this.ou, this.token)
        .subscribe({
          next: (data: Ou) => {
            this.ou = data;
            this.messagesService.success('closed ' + this.ou.objectId);
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

  saveOu() {
    if (this.ou.parentAffiliation != null && this.ou.parentAffiliation.objectId === '') {
      this.messagesService.warning('you MUST select a parent organization');
      return;
    }

    if (this.ou.parentAffiliation != null && this.ou.parentAffiliation.objectId === '') {
      this.ou.parentAffiliation = null;
    }

    if (this.isNewOu) {
      this.organizationsService.post(this.ousPath, this.ou, this.token)
        .subscribe({
          next: (data: Ou) => {
            this.ou = data;
            this.form.form.markAsPristine(); // resets form.dirty
            this.isNewOu = false;
            this.messagesService.success('added new organization ' + this.ou.metadata.name);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.put(this.ousPath + '/' + this.ou.objectId, this.ou, this.token)
        .subscribe({
          next: (data: Ou) => {
            this.ou = data;
            this.form.form.markAsPristine(); // resets form.dirty
            if (this.ou.parentAffiliation != null && this.ou.parentAffiliation.objectId !== '') {
              this.parentOuSearchTerm = this.ou.parentAffiliation.name;
            }
            this.messagesService.success('updated organization ' + this.ou.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  deleteOu() {
    if (confirm('delete ' + this.ou.metadata.name + ' ?')) {
      if (this.checkForm()) {
        this.organizationsService.delete(this.ousPath + '/' + this.ou.objectId, this.token)
          .subscribe({
            next: (_data) => {
              this.messagesService.success('deleted organization ' + this.ou.objectId);
              this.ou = null;
              this.gotoOrganizationList();
            },
            error: (e) => this.messagesService.error(e),
          });
      }
    }
  }

  gotoRef(id: string) {
    if (this.checkForm()) {
      this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
      };
      this.router.navigate(['/organization', id]);
    }
  }

  gotoOrganizationList() {
    if (this.checkForm()) {
      this.location.back();
    }
  }

  getParentOus(term: string) {
    if (term.length > 0 && !term.startsWith('"')) {
      this.returnSuggestedParentOus(term);
    } else if (term.length > 3 && term.startsWith('"') && term.endsWith('"')) {
      this.returnSuggestedParentOus(term);
    } else {
      this.closeParentOus();
    }
  }

  private getLoggedInUserAllOpenOus(ignoreOuId: string) {
    this.organizationsService.getallChildOus(this.loggedInUser.topLevelOuIds, ignoreOuId, null)
      .subscribe({
        next: (data: Ou[]) => {
          const ous: Ou[] = [];
          data.forEach((ou: Ou) => {
            if (ou.publicStatus === 'OPENED') {
              ous.push(ou);
            }
          });
          this.ousForLoggedInUser = ous;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private returnSuggestedParentOus(ouName: string) {
    const queryString = '?q=metadata.name.auto:' + ouName;
    this.organizationsService.filter(this.ousPath, null, queryString, 1)
      .subscribe({
        next: (data: {list: Ou[], records: number}) => {
          const ous: Ou[] = [];
          data.list.forEach((ou: Ou) => {
            if (ou.publicStatus === 'OPENED') {
              ous.push(ou);
            }
          });
          this.parentOus = ous;
          this.ou.parentAffiliation.objectId = null;
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

  onChangeParentOu(ou: Ou) {
    this.ou.parentAffiliation.objectId = ou.objectId;
  }

  clearParentOuSearchTerm() {
    this.parentOuSearchTerm = '';
  }

  addPredecessors() {
    this.isNewPredecessor = true;
  }

  addPredecessor() {
    this.organizationsService.addPredecessor(this.ou, this.predecessorOu.objectId, this.token)
      .subscribe({
        next: (data: Ou) => {
          this.setOu(data);
          this.form.form.markAsPristine(); // resets form.dirty
          this.messagesService.success('added predecessor ' + this.predecessorOu.metadata.name);
          this.resetPredecessors();
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  resetPredecessors() {
    this.isNewPredecessor = false;
    this.closePredecessorOus();
  }

  removePredecessor(predecessor: Ou) {
    if (confirm('remove predecessor ' + predecessor.metadata.name +' ?')) {
      this.organizationsService.removePredecessor(this.ou, predecessor.objectId, this.token)
        .subscribe({
          next: (data: Ou) => {
            this.setOu(data);
            this.messagesService.success('removed predecessor ' + predecessor.metadata.name);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  selectPredecessorOu(ou: Ou) {
    this.predecessorOuSearchTerm = ou.name;
    this.predecessorOu = ou;
    this.predecessorOus = [];
  };

  getPredecessorOus(term: string) {
    if (term.length > 0 && !term.startsWith('"')) {
      this.returnSuggestedPredecessorOus(term);
    } else if (term.length > 3 && term.startsWith('"') && term.endsWith('"')) {
      this.returnSuggestedPredecessorOus(term);
    } else {
      this.closePredecessorOus();
    }
  }

  private returnSuggestedPredecessorOus(predecessorOuName: string) {
    const queryString = '?q=metadata.name.auto:' + predecessorOuName;
    this.organizationsService.filter(this.ousPath, null, queryString, 1)
      .subscribe({
        next: (data: {list: Ou[], records: number}) => {
          const ous: Ou[] = [];
          data.list.forEach((ou: Ou) => {
            if (ou.objectId != this.ou.objectId ) {
              ous.push(ou);
            }
          });
          this.predecessorOus = ous;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  closePredecessorOus() {
    this.predecessorOuSearchTerm = '';
    this.predecessorOu = null;
    this.predecessorOus = [];
  }

  private checkForm(): boolean {
    if (!this.form.dirty && !this.isNewPredecessor) {
      return true;
    }

    if (confirm('you have unsaved changes. Proceed?')) {
      this.isNewPredecessor = false;
      this.isNewOu = false;
      return true;
    }

    return false;
  }
}
