import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Subscription} from 'rxjs';
import {Ctx, genres, Ou, subjects, User, workflow} from '../../base/common/model/inge';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {ContextsService} from '../services/contexts.service';

@Component({
  selector: 'context-details-component',
  templateUrl: './context-details.component.html',
  styleUrls: ['./context-details.component.scss'],
})
export class ContextDetailsComponent implements OnInit, OnDestroy {
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

  adminSubscription: Subscription;
  isAdmin: boolean;
  tokenSubscription: Subscription;
  token: string;
  userSubscription: Subscription;
  loggedInUser: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private contextsService: ContextsService,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.userSubscription = this.authenticationService.loggedInUser$.subscribe((data) => this.loggedInUser = data);

    this.setContext(this.activatedRoute.snapshot.data['ctx']);
    if (!this.isAdmin) {
      this.getLoggedInUserAllOpenOus(null);
    }

    if (this.ctx.name === 'new ctx') {
      this.isNewCtx = true;
      this.isNewOu = true;
    }

    this.genres2display = Object.keys(genres).filter((val) => val.match(/^[A-Z]/));

    this.workflows2display = Object.keys(workflow).filter((val) => val.match(/^[A-Z]/));
    this.workflow = this.ctx.workflow;
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  deleteGenre(genre: string) {
    const index = this.allowedGenres.indexOf(genre);
    this.allowedGenres.splice(index, 1);
  }

  deleteSubject(subject: string) {
    const index = this.allowedSubjects.indexOf(subject);
    this.allowedSubjects.splice(index, 1);
  }

  addGenres(genre: string[]) {
    this.selectedGenres = genre;
    this.selectedGenres.forEach((genre) => {
      if (!this.allowedGenres.includes(genre)) {
        this.allowedGenres.push(genre);
      }
    });
  }

  addSubjects(subject: string[]) {
    this.selectedSubjects = subject;
    this.selectedSubjects.forEach((subject) => {
      if (!this.allowedSubjects.includes(subject)) {
        this.allowedSubjects.push(subject);
      }
    });
  }

  addAllGenres() {
    this.genres2display.forEach((genre) => {
      if (!this.allowedGenres.includes(genre)) {
        this.allowedGenres.push(genre);
      }
    });
  }

  addAllSubjects() {
    this.subjects2display.forEach((subject) => {
      if (!this.allowedSubjects.includes(subject)) {
        this.allowedSubjects.push(subject);
      }
    });
  }

  clearGenres() {
    if (confirm('remove all genres ?')) {
      this.allowedGenres.splice(0, this.allowedGenres.length);
    }
  }

  clearSubjects() {
    if (confirm('remove all subject classifications ?')) {
      this.allowedSubjects.splice(0, this.allowedSubjects.length);
    }
  }

  onChangedWorkflow(value: string) {
    this.ctx.workflow = value;
  }

  openCtx() {
    if (this.ctx.state === 'CLOSED') {
      let ou:Ou;
      this.organizationsService.get(this.ousPath, this.ctx.responsibleAffiliations[0].objectId, this.token)
        .subscribe({
          next: (data) => {
            ou = data;
            if (ou.publicStatus !== 'OPENED') {
              this.messagesService.warning('Closed contexts of closed organizations must not be opened. ');
            } else {
              this.contextsService.openCtx(this.ctx, this.token)
                .subscribe({
                  next: (data) => {
                    this.ctx = data;
                    this.messagesService.success('Opened ' + this.ctx.objectId);
                  },
                  error: (e) => this.messagesService.error(e),
                });
            }
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.contextsService.closeCtx(this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.ctx = data;
            this.messagesService.success('Closed ' + this.ctx.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  deleteCtx() {
    if (confirm('delete ' + this.ctx.name + ' ?')) {
      this.contextsService.delete(this.ctxsPath + '/' + this.ctx.objectId, this.token)
        .subscribe({
          next: (_data) => {
            this.messagesService.success('deleted context ' + this.ctx.objectId);
            this.ctx = null;
            this.gotoCtxList();
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  gotoCtxList() {
    this.router.navigate(['/contexts']);
  }

  saveCtx() {
    if (this.ctx.name.includes('new ctx')) {
      this.messagesService.warning('name MUST NOT be new ctx');
      return;
    }

    if (this.ctx.name == null) {
      this.messagesService.warning('name MUST NOT be empty');
      return;
    }

    if (this.ctx.responsibleAffiliations.length === 0) {
      this.messagesService.warning('you MUST select an organization');
      return;
    }

    if (this.ctx.allowedGenres.length === 0) {
      this.messagesService.warning('select at least one allowed genre');
      return;
    }

    if (this.isNewCtx) {
      this.contextsService.post(this.ctxsPath, this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.setContext(data);
            this.isNewCtx = false;
            this.isNewOu = false;
            this.messagesService.success('added new context ' + this.ctx.name);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.contextsService.put(this.ctxsPath + '/' + this.ctx.objectId, this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.setContext(data);
            this.isNewOu = false;
            this.messagesService.success('updated context ' + this.ctx.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  getOus(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedOus(convertedSearchTerm);
    } else {
      this.closeOus();
    }
  }

  getLoggedInUserAllOpenOus(ignoreOuId: string) {
    this.organizationsService.getallChildOus(this.loggedInUser.topLevelOuIds, ignoreOuId, null).subscribe((data) => {
      const ous: Ou[] = [];
      data.forEach((ou: Ou) => {
        if (ou.publicStatus === 'OPENED') {
          ous.push(ou);
        }
      });
      this.ousForLoggedInUser = ous;
    });
  }

  private returnSuggestedOus(term: string) {
    const queryString = '?q=metadata.name.auto:' + term;
    this.organizationsService.filter(this.ousPath, null, queryString, 1)
      .subscribe({
        next: (data) => {
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

  closeOus() {
    this.ouSearchTerm = '';
    this.selectedOu = null;
    this.ous = [];
  }

  selectOu(ou: Ou) {
    this.ouSearchTerm = ou.name;
    this.selectedOu = ou;
    this.ctx.responsibleAffiliations.push(this.organizationsService.makeAffiliation(this.selectedOu.objectId));
    this.ous = [];
  };

  changeOu() {
    this.isNewOu = true;
    this.closeOus();
    this.ctx.responsibleAffiliations = [];
  }

  private setContext(ctx: Ctx) {
    this.ctx = ctx;
    this.initializeAllowed();
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
}
