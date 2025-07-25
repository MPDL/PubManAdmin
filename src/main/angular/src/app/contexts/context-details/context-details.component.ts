import { Location } from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Ctx, genres, Ou, subjects, workflow} from '../../base/common/model/inge';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {ContextsService} from '../services/contexts.service';
import {NgxPaginationModule} from 'ngx-pagination';
import {ClickOutsideDirective} from '../../base/directives/clickoutside.directive';
import {ForbiddenNameDirective} from '../../base/directives/forbidden-name.directive';

@Component({
  selector: 'context-details-component',
  templateUrl: './context-details.component.html',
  styleUrls: ['./context-details.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgxPaginationModule,
    ClickOutsideDirective,
    ForbiddenNameDirective
]
})
export class ContextDetailsComponent implements OnInit {
  @ViewChild('form')
  form: NgForm;

  ctxsPath: string = environment.restCtxs;
  ousPath: string = environment.restOus;

  ctx: Ctx;
  isNewCtx: boolean = false;

  genres2display: string[] = [];
  selectedGenres: string[];
  allowedGenres: string[] = [];

  subjects2display: string[] = [];
  selectedSubjects: string[];
  allowedSubjects: string[] = [];

  workflows2display: string[] = [];
  workflow: string;

  ousForLoggedInUser: Ou[];
  ous: Ou[] = [];
  selectedOu: Ou;
  ouSearchTerm: string = '';
  isNewOu: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    protected authenticationService: AuthenticationService,
    private contextsService: ContextsService,
    private location: Location,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
  ) {
  }

  ngOnInit() {
    this.setContext(this.activatedRoute.snapshot.data['ctx']);

    if (!this.authenticationService.isAdmin) {
      this.getLoggedInUserAllOpenOus();
    }

    if (this.ctx.name === 'new ctx') {
      this.ctx.name = null;
      this.isNewCtx = true;
      this.isNewOu = true;
    }

    this.genres2display = Object.keys(genres).filter((val) => val.match(/^[A-Z]/));

    this.workflows2display = Object.keys(workflow).filter((val) => val.match(/^[A-Z]/));
    this.workflow = this.ctx.workflow;
  }

  addGenres(genre: string[]) {
    this.selectedGenres = genre;
    this.selectedGenres.forEach((genre) => {
      if (!this.allowedGenres.includes(genre)) {
        this.allowedGenres.push(genre);
      }
    });
  }

  addAllGenres() {
    this.genres2display.forEach((genre) => {
      if (!this.allowedGenres.includes(genre)) {
        this.allowedGenres.push(genre);
      }
    });
    this.markAsDirty();
  }

  addSubjects(subject: string[]) {
    this.selectedSubjects = subject;
    this.selectedSubjects.forEach((subject) => {
      if (!this.allowedSubjects.includes(subject)) {
        this.allowedSubjects.push(subject);
      }
    });
  }

  addAllSubjects() {
    this.subjects2display.forEach((subject) => {
      if (!this.allowedSubjects.includes(subject)) {
        this.allowedSubjects.push(subject);
      }
    });
    this.markAsDirty();
  }

  changeCtxState() {
    if (this.ctx.state === 'CLOSED') {
      this.organizationsService.get(this.ousPath, this.ctx.responsibleAffiliations[0].objectId)
        .subscribe({
          next: (data: Ou) => {
            if (data.publicStatus !== 'OPENED') {
              if (confirm('Closed contexts of closed organizations should not be opened. Proceed?')) {
                this.contextsService.openCtx(this.ctx)
                  .subscribe({
                    next: (data: Ctx) => {
                      this.ctx = data;
                      this.messagesService.success('opened ' + this.ctx.objectId);
                    },
                    error: (e) => this.messagesService.error(e),
                  });
              }
            } else {
              this.contextsService.openCtx(this.ctx)
                .subscribe({
                  next: (data: Ctx) => {
                    this.ctx = data;
                    this.messagesService.success('opened ' + this.ctx.objectId);
                  },
                  error: (e) => this.messagesService.error(e),
                });
            }
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.contextsService.closeCtx(this.ctx)
        .subscribe({
          next: (data: Ctx) => {
            this.ctx = data;
            this.messagesService.success('closed ' + this.ctx.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  changeOu() {
    this.isNewOu = true;
    this.closeOus();
    this.ctx.responsibleAffiliations = [];
  }

  clearGenres() {
    if (confirm('Remove all genres?')) {
      this.allowedGenres.splice(0, this.allowedGenres.length);
      this.markAsDirty();
    }
  }

  clearSubjects() {
    if (confirm('Remove all subject classifications?')) {
      this.allowedSubjects.splice(0, this.allowedSubjects.length);
      this.markAsDirty();
    }
  }

  closeOus() {
    this.ouSearchTerm = '';
    this.selectedOu = null;
    this.ous = [];
  }

  deleteCtx() {
    if (confirm('Delete ' + this.ctx.name + '?')) {
      if (this.checkForm()) {
        this.contextsService.delete(this.ctxsPath + '/' + this.ctx.objectId)
          .subscribe({
            next: (_data) => {
              this.messagesService.success('deleted context ' + this.ctx.objectId);
              this.ctx = null;
              this.router.navigate(['/contexts']);
            },
            error: (e) => this.messagesService.error(e),
          });
      }
    }
  }

  deleteGenre(genre: string) {
    const index = this.allowedGenres.indexOf(genre);
    this.allowedGenres.splice(index, 1);
    this.markAsDirty();
  }

  deleteSubject(subject: string) {
    const index = this.allowedSubjects.indexOf(subject);
    this.allowedSubjects.splice(index, 1);
    this.markAsDirty();
  }

  getOus(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedOus(convertedSearchTerm);
    } else {
      this.closeOus();
    }
  }

  gotoCtxList() {
    if (this.checkForm()) {
      this.location.back();
    }
  }

  gotoRef(id: string) {
    if (this.checkForm()) {
      this.router.navigate(['/organization', id]);
    }
  }

  saveCtx() {
    if (this.ctx.responsibleAffiliations.length === 0) {
      this.messagesService.warning('you MUST select an organization');
      return;
    }

    if (this.ctx.allowedGenres.length === 0) {
      this.messagesService.warning('select at least one allowed genre');
      return;
    }

    if (this.isNewCtx) {
      this.contextsService.post(this.ctxsPath, this.ctx)
        .subscribe({
          next: (data: Ctx) => {
            this.setContext(data);
            this.form.form.markAsPristine(); // resets form.dirty
            this.isNewCtx = false;
            this.isNewOu = false;
            this.messagesService.success('added new context ' + this.ctx.name);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.contextsService.put(this.ctxsPath + '/' + this.ctx.objectId, this.ctx)
        .subscribe({
          next: (data: Ctx) => {
            this.setContext(data);
            this.form.form.markAsPristine(); // resets form.dirty
            this.isNewOu = false;
            this.messagesService.success('updated context ' + this.ctx.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  selectOu(ou: Ou) {
    this.ouSearchTerm = ou.name;
    this.selectedOu = ou;
    this.ctx.responsibleAffiliations.push(this.organizationsService.makeAffiliation(this.selectedOu.objectId, this.selectedOu.name));
    this.ous = [];
    this.isNewOu = false;
  };

  private checkForm(): boolean {
    if (!this.form.dirty) {
      return true;
    }

    if (confirm('You have unsaved changes. Proceed?')) {
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

  private initializeAllowed() {
    if (this.ctx.allowedGenres != null) {
      this.allowedGenres = this.ctx.allowedGenres || [];
    } else {
      this.ctx.allowedGenres = [];
      this.allowedGenres = this.ctx.allowedGenres;
    }
    this.subjects2display = Object.keys(subjects).filter((val) => val.match(/^[A-Z]/));
    if (this.ctx.allowedSubjectClassifications != null) {
      this.allowedSubjects = this.ctx.allowedSubjectClassifications || [];
    } else {
      this.ctx.allowedSubjectClassifications = [];
      this.allowedSubjects = this.ctx.allowedSubjectClassifications;
    }
  }

  private markAsDirty() {
    (<any>Object).values(this.form.controls).forEach((control: { markAsDirty: () => void; }) => {
      control.markAsDirty();
    });
  }

  private returnSuggestedOus(ouName: string) {
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
          this.ous = ous;
          this.ctx.responsibleAffiliations = [];
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private setContext(ctx: Ctx) {
    this.ctx = ctx;
    this.initializeAllowed();
  }
}
