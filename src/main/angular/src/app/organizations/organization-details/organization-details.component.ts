
import {Component, OnInit, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {SearchService} from 'app/base/common/services/search.service';
import {environment} from 'environments/environment';
import {Identifier, Ou} from '../../base/common/model/inge';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {OrganizationsService} from '../services/organizations.service';
import {NgxPaginationModule} from 'ngx-pagination';
import {ClickOutsideDirective} from '../../base/directives/clickoutside.directive';
import {ForbiddenNameDirective} from '../../base/directives/forbidden-name.directive';
import {ForbiddenCharacterDirective} from '../../base/directives/forbidden-character.directive';

@Component({
  selector: 'organization-details-component',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgxPaginationModule,
    ClickOutsideDirective,
    ForbiddenNameDirective,
    ForbiddenCharacterDirective
]
})
export class OrganizationDetailsComponent implements OnInit {
  @ViewChild('form')
  form: NgForm;

  ousPath: string = environment.restOus;

  isNewOu: boolean = false;
  ou: Ou;
  ousForLoggedInUser: Ou[];

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

  constructor(
    private activatedRoute: ActivatedRoute,
    protected authenticationService: AuthenticationService,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
  ) {
  }

  ngOnInit() {
    this.setOu(this.activatedRoute.snapshot.data['ou']);
    this.hasOpenChildren = false;
    this.hasOpenParent = true;

    if (!this.authenticationService.isAdmin) {
      this.getLoggedInUserAllOpenOus();
    }

    if (this.ou.metadata.name === 'new ou') {
      this.ou.metadata.name = null;
      this.isNewOu = true;
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

  addPredecessor() {
    this.organizationsService.addPredecessor(this.ou, this.predecessorOu.objectId)
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

  addPredecessors() {
    this.isNewPredecessor = true;
  }

  changeOuState() {
    if (this.ou.publicStatus === 'CREATED' || this.ou.publicStatus === 'CLOSED') {
      this.organizationsService.openOu(this.ou)
        .subscribe({
          next: (data: Ou) => {
            this.ou = data;
            this.messagesService.success('opened ' + this.ou.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.closeOu(this.ou)
        .subscribe({
          next: (data: Ou) => {
            this.ou = data;
            this.messagesService.success('closed ' + this.ou.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  clearAlternativeNames() {
    if (confirm('Remove all subject alternative names?')) {
      if (this.ou.metadata.alternativeNames != null) {
        this.ou.metadata.alternativeNames.splice(0, this.ou.metadata.alternativeNames.length);
        this.markAsDirty();
      }
    }
  }

  clearDescriptions() {
    if (confirm('Remove all descriptions?')) {
      if (this.ou.metadata.descriptions != null) {
        this.ou.metadata.descriptions.splice(0, this.ou.metadata.descriptions.length);
        this.markAsDirty();
      }
    }
  }

  clearIdentifiers() {
    if (confirm('Remove all identificators?')) {
      if (this.ou.metadata.identifiers != null) {
        this.ou.metadata.identifiers.splice(0, this.ou.metadata.identifiers.length);
        this.markAsDirty();
      }
    }
  }

  clearParentOuSearchTerm() {
    this.parentOuSearchTerm = '';
  }

  closeParentOus() {
    this.parentOuSearchTerm = '';
    this.parentOus = [];
  }

  closePredecessorOus() {
    this.predecessorOuSearchTerm = '';
    this.predecessorOu = null;
    this.predecessorOus = [];
  }

  deleteAlternativeName(selected: string) {
    const index = this.ou.metadata.alternativeNames.indexOf(selected);
    this.ou.metadata.alternativeNames.splice(index, 1);
    this.markAsDirty();
  }

  deleteDescription(selected: string) {
    const index = this.ou.metadata.descriptions.indexOf(selected);
    this.ou.metadata.descriptions.splice(index, 1);
    this.markAsDirty();
  }

  deleteIdentifier(selected: Identifier) {
    const index = this.ou.metadata.identifiers.indexOf(selected);
    this.ou.metadata.identifiers.splice(index, 1);
    this.markAsDirty();
  }

  deleteOu() {
    if (confirm('Delete ' + this.ou.metadata.name + '?')) {
      if (this.checkForm()) {
        this.organizationsService.delete(this.ousPath + '/' + this.ou.objectId)
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

  getParentOus(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedParentOus(convertedSearchTerm);
    } else {
      this.closeParentOus();
    }
  }

  getPredecessorOus(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedPredecessorOus(convertedSearchTerm);
    } else {
      this.closePredecessorOus();
    }
  }

  gotoOrganizationList() {
    if (this.checkForm()) {
      if (this.ou != null && this.ou.objectId != null) {
        this.router.navigate(['/organizations', this.ou.objectId]);
      } else {
        this.router.navigate(['/organizations']);
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

  onChangeParentOu(ou: Ou) {
    this.ou.parentAffiliation.objectId = ou.objectId;
  }

  removePredecessor(predecessor: Ou) {
    if (confirm('Remove predecessor ' + predecessor.metadata.name + '?')) {
      this.organizationsService.removePredecessor(this.ou, predecessor.objectId)
        .subscribe({
          next: (data: Ou) => {
            this.setOu(data);
            this.messagesService.success('removed predecessor ' + predecessor.metadata.name);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  resetPredecessors() {
    this.isNewPredecessor = false;
    this.closePredecessorOus();
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
      this.organizationsService.post(this.ousPath, this.ou)
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
      this.organizationsService.put(this.ousPath + '/' + this.ou.objectId, this.ou)
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

  selectParentOu(ou: Ou) {
    this.parentOuSearchTerm = ou.name;
    this.ou.parentAffiliation.objectId = ou.objectId;
    this.parentOus = [];
  };

  selectPredecessorOu(ou: Ou) {
    this.predecessorOuSearchTerm = ou.name;
    this.predecessorOu = ou;
    this.predecessorOus = [];
  };

  private checkForm(): boolean {
    if (!this.form.dirty && !this.isNewPredecessor) {
      return true;
    }

    if (confirm('You have unsaved changes. Proceed?')) {
      this.isNewPredecessor = false;
      this.isNewOu = false;
      return true;
    }

    return false;
  }

  private getLoggedInUserAllOpenOus() {
    this.organizationsService.getallChildOus(this.authenticationService.loggedInUser.topLevelOuIds, null)
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

  private listChildren(mother: string) {
    this.organizationsService.listChildren4Ou(mother)
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

  private listPredecessors(listOfPredecessorIds: string) {
    const queryString = '?q=' + listOfPredecessorIds;
    this.organizationsService.filter(this.ousPath, queryString, 1)
      .subscribe({
        next: (data: { list: Ou[], records: number }) => this.predecessors = data.list,
        error: (e) => this.messagesService.error(e),
      });
  }

  private markAsDirty() {
    (<any>Object).values(this.form.controls).forEach((control: { markAsDirty: () => void; }) => {
      control.markAsDirty();
    });
  }

  private returnSuggestedParentOus(ouName: string) {
    const queryString = '?q=metadata.name.auto:' + ouName;
    this.organizationsService.filter(this.ousPath, queryString, 1)
      .subscribe({
        next: (data: { list: Ou[], records: number }) => {
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

  private returnSuggestedPredecessorOus(predecessorOuName: string) {
    const queryString = '?q=metadata.name.auto:' + predecessorOuName;
    this.organizationsService.filter(this.ousPath, queryString, 1)
      .subscribe({
        next: (data: { list: Ou[], records: number }) => {
          const ous: Ou[] = [];
          data.list.forEach((ou: Ou) => {
            if (ou.objectId != this.ou.objectId) {
              ous.push(ou);
            }
          });
          this.predecessorOus = ous;
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private setOu(ou: Ou) {
    this.ou = ou;
    if (this.ou.parentAffiliation != null && this.ou.parentAffiliation.objectId !== '') {
      this.parentOuSearchTerm = this.ou.parentAffiliation.name;
      let parentOu: Ou;
      this.organizationsService.get(this.ousPath, this.ou.parentAffiliation.objectId)
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
      this.listPredecessors(this.searchService.getListOfIds(predecessorIds, 'objectId'));
    } else {
      this.predecessors = [];
    }
    this.listChildren(this.ou.objectId);
  }
}
