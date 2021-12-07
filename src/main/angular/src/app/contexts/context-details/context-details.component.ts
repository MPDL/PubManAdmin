import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SearchService} from 'app/base/common/services/search.service';
import {OrganizationsService} from 'app/organizations/services/organizations.service';
import {environment} from 'environments/environment';
import {Subscription} from 'rxjs';
import {BasicRO, Ctx, genres, Ou, subjects, User, workflow} from '../../base/common/model/inge';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {ContextsService} from '../services/contexts.service';

@Component({
  selector: 'context-details-component',
  templateUrl: './context-details.component.html',
  styleUrls: ['./context-details.component.scss'],
})
export class ContextDetailsComponent implements OnInit, OnDestroy {
  ctxsUrl = environment.restCtxs;
  ousUrl = environment.restOus;

  @ViewChild('f')
    form: any;

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
    private organizationService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.userSubscription = this.authenticationService.user$.subscribe((data) => this.loggedInUser = data);

    this.ctx = this.activatedRoute.snapshot.data['ctx'];

    if (this.ctx.name === 'new ctx') {
      this.isNewCtx = true;
      this.isNewOu = true;
    }

    this.genres2display = Object.keys(genres).filter((val) => val.match(/^[A-Z]/));
    this.initializeAllowed(this.ctx);

    this.workflows2display = Object.keys(workflow).filter((val) => val.match(/^[A-Z]/));
    this.workflow = this.ctx.workflow;
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  initializeAllowed(ctx: Ctx) {
    if (ctx.allowedGenres != null) {
      this.allowedGenres = this.ctx.allowedGenres || [];
    } else {
      this.ctx.allowedGenres = [];
      this.allowedGenres = this.ctx.allowedGenres;
    }
    this.subjects2display = Object.keys(subjects).filter((val) => val.match(/^[A-Z]/));
    if (ctx.allowedSubjectClassifications != null) {
      this.allowedSubjects = this.ctx.allowedSubjectClassifications || [];
    } else {
      this.ctx.allowedSubjectClassifications = [];
      this.allowedSubjects = this.ctx.allowedSubjectClassifications;
    }
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
    this.allowedGenres.splice(0, this.allowedGenres.length);
  }

  clearSubjects() {
    this.allowedSubjects.splice(0, this.allowedSubjects.length);
  }

  onChangedWorkflow(value: string) {
    this.ctx.workflow = value;
  }

  openCtx(ctx: Ctx) {
    this.ctx = ctx;
    if (this.ctx.state === 'CLOSED') {
      this.contextsService.openCtx(this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.ctx = data;
            this.messagesService.success('Opened ' + ctx.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.contextsService.closeCtx(this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.ctx = data;
            this.messagesService.success('Closed ' + ctx.objectId);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  deleteCtx(ctx: Ctx) {
    this.ctx = ctx;
    const id = this.ctx.objectId;
    if (confirm('delete ' + ctx.name + ' ?')) {
      this.contextsService.delete(this.ctxsUrl + '/' + id, this.token)
        .subscribe({
          next: (data) => this.messagesService.success('deleted ' + id + ' ' + data),
          error: (e) => this.messagesService.error(e),
        });
      this.gotoCtxList();
    }
  }

  gotoCtxList() {
    this.router.navigate(['/contexts']);
  }

  saveCtx(ctx: Ctx) {
    this.ctx = ctx;

    if (this.ctx.name.includes('new ctx')) {
      this.messagesService.warning('name MUST NOT be new ctx');
      return;
    }

    if (this.ctx.name == null) {
      this.messagesService.warning('name MUST NOT be empty');
      return;
    }

    if (this.selectedOu != null && this.isNewOu) {
      const ouId = this.selectedOu.objectId;
      const aff = new BasicRO();
      aff.objectId = ouId;
      this.ctx.responsibleAffiliations.push(aff);
    } else if (this.ctx.responsibleAffiliations.length === 0) {
      this.messagesService.warning('you MUST select an organization');
      return;
    }

    if (this.ctx.allowedGenres.length === 0) {
      this.messagesService.warning('select at least one allowed genre');
      return;
    }

    if (this.isNewCtx) {
      this.contextsService.post(this.ctxsUrl, this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('added new context ' + this.ctx.name);
            this.isNewCtx = false;
            this.isNewOu = false;
            this.ctx = data;
            this.initializeAllowed(this.ctx);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.contextsService.put(this.ctxsUrl + '/' + this.ctx.objectId, this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('updated context ' + this.ctx.objectId);
            this.ctx = data;
            this.isNewOu = false;
            this.initializeAllowed(this.ctx);
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
    this.selectedOu = null;
    this.ous = [];
  }

  selectOu(ou: Ou) {
    this.ouSearchTerm = ou.name;
    this.selectedOu = ou;
    this.ous = [];
  };

  changeOu() {
    this.isNewOu = true;
    this.closeOus();
    this.ctx.responsibleAffiliations = [];
  }
}
