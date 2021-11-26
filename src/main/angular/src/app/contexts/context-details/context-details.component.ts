import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

import {ContextsService} from '../services/contexts.service';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {BasicRO, Ctx, genres, subjects, User, workflow} from '../../base/common/model/inge';
import {allOpenedOUs} from '../../base/common/model/query-bodies';

import {environment} from 'environments/environment';

@Component({
  selector: 'context-details-component',
  templateUrl: './context-details.component.html',
  styleUrls: ['./context-details.component.scss'],
})
export class ContextDetailsComponent implements OnInit, OnDestroy {
  url = environment.restCtxs;
  ousUrl = environment.restOus;

  @ViewChild('f')
    form: any;

  ctx: Ctx;
  isNewCtx: boolean = false;
  ous: any[];
  selectedOu: any;
  ounames: any[] = [];
  searchTerm;
  genres2display: string[] = [];
  selectedGenres: string[];
  allowedGenres: string[] = [];
  subjects2display: string[] = [];
  selectedSubjects: string[];
  allowedSubjects: string[] = [];
  workflows2display: string[] = [];
  selectedWorkflow: string;

  adminSubscription: Subscription;
  isAdmin: boolean;
  tokenSubscription: Subscription;
  token: string;
  userSubscription: Subscription;
  loggedInUser: User;

  constructor(
    private contextsService: ContextsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private messagesService: MessagesService
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.userSubscription = this.authenticationService.user$.subscribe((data) => this.loggedInUser = data);

    this.ctx = this.activatedRoute.snapshot.data['ctx'];
    if (this.ctx.name === 'new ctx') {
      this.isNewCtx = true;
      this.listOuNames();
    }
    this.genres2display = Object.keys(genres).filter((val) => val.match(/^[A-Z]/));
    this.initializeAllowed(this.ctx);

    this.workflows2display = Object.keys(workflow).filter((val) => val.match(/^[A-Z]/));
    this.selectedWorkflow = this.ctx.workflow;
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  initializeAllowed(ctx) {
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

  listOuNames() {
    const body = allOpenedOUs;
    this.contextsService.query(this.ousUrl, null, body).subscribe((data) => this.ous = data.list);
  }

  onChangeOu(val) {
    this.selectedOu = val;
  }

  getSelectedCtx(id) {
    this.contextsService.get(this.url, id, this.token)
      .subscribe({
        next: (data) => this.ctx = data,
        error: (e) => this.messagesService.error(e),
      });
  }

  isSelected(genre) {
    return true;
  }

  deleteGenre(genre) {
    const index = this.allowedGenres.indexOf(genre);
    this.allowedGenres.splice(index, 1);
  }

  deleteSubject(subject) {
    const index = this.allowedSubjects.indexOf(subject);
    this.allowedSubjects.splice(index, 1);
  }

  addGenres(selected) {
    this.selectedGenres = selected;
    this.selectedGenres.forEach((g) => {
      if (!this.allowedGenres.includes(g)) {
        this.allowedGenres.push(g);
      }
    });
  }

  addSubjects(selected) {
    this.selectedSubjects = selected;
    this.selectedSubjects.forEach((s) => {
      if (!this.allowedSubjects.includes(s)) {
        this.allowedSubjects.push(s);
      }
    });
  }

  addAllGenres() {
    this.genres2display.forEach((g) => {
      if (!this.allowedGenres.includes(g)) {
        this.allowedGenres.push(g);
      }
    });
  }

  addAllSubjects() {
    this.subjects2display.forEach((s) => {
      if (!this.allowedSubjects.includes(s)) {
        this.allowedSubjects.push(s);
      }
    });
  }

  clearGenres() {
    this.allowedGenres.splice(0, this.allowedGenres.length);
  }

  clearSubjects() {
    this.allowedSubjects.splice(0, this.allowedSubjects.length);
  }

  onChangedWorkflow(value) {
    this.ctx.workflow = value;
  }

  activateCtx(ctx) {
    this.ctx = ctx;
    if (this.ctx.state === 'CREATED' || this.ctx.state === 'CLOSED') {
      this.contextsService.openCtx(this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.getSelectedCtx(this.ctx.objectId);
            this.messagesService.success('Opened ' + ctx.objectId + ' ' + data);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.contextsService.closeCtx(this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.getSelectedCtx(this.ctx.objectId);
            this.messagesService.success('Closed ' + ctx.objectId + ' ' + data);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  delete(ctx) {
    this.ctx = ctx;
    const id = this.ctx.objectId;
    if (confirm('delete '+ctx.name+' ?')) {
      this.contextsService.delete(this.url + '/' + id, this.ctx, this.token)
        .subscribe({
          next: (data) => this.messagesService.success('deleted ' + id + ' ' + data),
          error: (e) => this.messagesService.error(e),
        });
      this.gotoList();
    }
  }

  gotoList() {
    this.router.navigate(['/contexts']);
  }

  save(ctx2save) {
    this.ctx = ctx2save;
    if (this.ctx.name.includes('new ctx')) {
      this.messagesService.warning('name MUST NOT be new ctx');
      return;
    }

    if (this.isNewCtx) {
      if (this.selectedOu != null) {
        const ouId = this.selectedOu.objectId;
        const aff = new BasicRO();
        aff.objectId = ouId;
        this.ctx.responsibleAffiliations.push(aff);
      } else {
        this.messagesService.warning('you MUST select an organization');
        return;
      }
      if (this.ctx.allowedGenres.length === 0) {
        this.messagesService.warning('select at least one allowed genre');
        return;
      }
      this.contextsService.post(this.url, this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('added new context ' + this.ctx.name);
            this.isNewCtx = false;
            this.ctx = data;
            this.initializeAllowed(this.ctx);
          },
          error: (e) => this.messagesService.error(e),
        });
    } else {
      if (this.ctx.allowedGenres.length === 0) {
        this.messagesService.warning('select at least one allowed genre');
        return;
      }
      this.contextsService.put(this.url + '/' + this.ctx.objectId, this.ctx, this.token)
        .subscribe({
          next: (data) => {
            this.messagesService.success('updated ' + this.ctx.objectId);
            this.ctx = data;
            this.initializeAllowed(this.ctx);
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  getNames(term) {
    if (term.length > 0 && !term.startsWith('"')) {
      this.returnSuggestedOUs(term);
    } else if (term.length > 3 && term.startsWith('"') && term.endsWith('"')) {
      this.returnSuggestedOUs(term);
    }
  }

  returnSuggestedOUs(term) {
    const ouNames: any[] = [];
    const url = environment.restOus;
    const queryString = '?q=metadata.name.auto:' + term;
    this.contextsService.filter(url, null, queryString, 1)
      .subscribe({
        next: (data) => {
          data.list.forEach((ou) => ouNames.push(ou));
          if (ouNames.length > 0) {
            this.ounames = ouNames;
          } else {
            this.ounames = [];
          }
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  close() {
    this.searchTerm = '';
    this.ounames = [];
  }

  select(term) {
    this.searchTerm = term.metadata.name;
    this.selectedOu = term;
    this.ounames = [];
  }
}
