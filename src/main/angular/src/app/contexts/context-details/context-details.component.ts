import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ContextsService } from '../services/contexts.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { MessagesService } from '../../base/services/messages.service';
import { BasicRO, Context, genres, subjects, workflow } from '../../base/common/model/inge';
import { allOpenedOUs } from '../../base/common/model/query-bodies';

import { environment } from 'environments/environment';

@Component({
  selector: 'app-context-details',
  templateUrl: './context-details.component.html',
  styleUrls: ['./context-details.component.scss']
})
export class ContextDetailsComponent implements OnInit, OnDestroy {

  url = environment.rest_contexts;
  ous_url = environment.rest_ous;

  @ViewChild('f') form: any;

  token: string;
  ctx: Context;
  isNewCtx: boolean = false;
  ous: any[];
  selectedOu: any;
  ounames: any[] = [];
  searchTerm;
  subscription: Subscription;
  loginSubscription: Subscription;
  genres2display: string[] = [];
  selectedGenres: string[];
  allowedGenres: string[] = [];
  subjects2display: string[] = [];
  selectedSubjects: string[];
  allowedSubjects: string[] = [];
  workflows2display: string[] = [];
  selectedWorkflow: string;

  constructor(private ctxSvc: ContextsService,
    private router: Router,
    private route: ActivatedRoute,
    private login: AuthenticationService,
    private message: MessagesService) { }

  ngOnInit() {
    this.ctx = this.route.snapshot.data['ctx'];
    if (this.ctx.name === 'new ctx') {
      this.isNewCtx = true;
      this.listOuNames();
    }
    this.loginSubscription = this.login.token$.subscribe(token => {
      this.token = token;
    });
    this.genres2display = Object.keys(genres).filter(val => val.match(/^[A-Z]/));
    this.initializeAllowed(this.ctx);

    this.workflows2display = Object.keys(workflow).filter(val => val.match(/^[A-Z]/));
    this.selectedWorkflow = this.ctx.workflow;
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }

  initializeAllowed(ctx) {
    if (ctx.allowedGenres != null) {
      this.allowedGenres = this.ctx.allowedGenres || [];
    } else {
      this.ctx.allowedGenres = [];
      this.allowedGenres = this.ctx.allowedGenres;
    }
    this.subjects2display = Object.keys(subjects).filter(val => val.match(/^[A-Z]/));
    if (ctx.allowedSubjectClassifications != null) {
      this.allowedSubjects = this.ctx.allowedSubjectClassifications || [];
    } else {
      this.ctx.allowedSubjectClassifications = [];
      this.allowedSubjects = this.ctx.allowedSubjectClassifications;
    }
  }

  listOuNames() {
    const body = allOpenedOUs;
    this.ctxSvc.query(this.ous_url, null, body)
      .subscribe(ous => {
        this.ous = ous.list;
      });
  }

  onChangeOu(val) {
    this.selectedOu = val;
  }

  getSelectedCtx(id) {
    this.ctxSvc.get(this.url, id, this.token)
      .subscribe(ctx => {
        this.ctx = ctx;
      },
      error => {
        this.message.error(error);
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
    this.selectedGenres.forEach(g => {
      if (!this.allowedGenres.includes(g)) {
        this.allowedGenres.push(g);
      }
    });
  }

  addSubjects(selected) {
    this.selectedSubjects = selected;
    this.selectedSubjects.forEach(s => {
      if (!this.allowedSubjects.includes(s)) {
        this.allowedSubjects.push(s);
      }
    });
  }

  addAllGenres() {
    this.genres2display.forEach(g => {
      if (!this.allowedGenres.includes(g)) {
        this.allowedGenres.push(g);
      }
    });
  }

  addAllSubjects() {
    this.subjects2display.forEach(s => {
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

  activateContext(ctx) {
    this.ctx = ctx;
    if (this.ctx.state === 'CREATED' || this.ctx.state === 'CLOSED') {
      this.ctxSvc.openContext(this.ctx, this.token)
        .subscribe(httpStatus => {
          this.getSelectedCtx(this.ctx.objectId);
          this.message.success('Opened ' + ctx.objectId + ' ' + httpStatus);
        }, error => {
          this.message.error(error);
        });
    } else {
      this.ctxSvc.closeContext(this.ctx, this.token)
        .subscribe(httpStatus => {
          this.getSelectedCtx(this.ctx.objectId);
          this.message.success('Closed ' + ctx.objectId + ' ' + httpStatus);
        }, error => {
          this.message.error(error);
        });
    }
  }

  delete(ctx) {
    this.ctx = ctx;
    const id = this.ctx.objectId;
    if (confirm('delete '+ctx.name+' ?')) {
      this.ctxSvc.delete(this.url + '/' + id, this.ctx, this.token)
      .subscribe(
      data => {
        this.message.success('deleted ' + id + ' ' + data);
      }, error => {
        this.message.error(error);
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
      this.message.warning('name MUST NOT be new ctx');
      return;
    }

    if (this.isNewCtx) {
      if (this.selectedOu != null) {
        const ou_id = this.selectedOu.objectId;
        const aff = new BasicRO();
        aff.objectId = ou_id;
        this.ctx.responsibleAffiliations.push(aff);
      } else {
        this.message.warning('you MUST select an organization');
        return;
      }
      if (this.ctx.allowedGenres.length === 0) {
        this.message.warning('select at least one allowed genre');
        return;
      }
      this.ctxSvc.post(this.url, this.ctx, this.token)
        .subscribe(
        data => {
          this.message.success('added new context ' + this.ctx.name);
          this.isNewCtx = false;
          this.ctx = data;
          this.initializeAllowed(this.ctx);
          // this.gotoList();
        },
        error => {
          this.message.error(error);
        }
        );

    } else {
      if (this.ctx.allowedGenres.length === 0) {
        this.message.warning('select at least one allowed genre');
        return;
      }
      // this.message.success('updating ' + this.ctx.objectId);
      this.ctxSvc.put(this.url + '/' + this.ctx.objectId, this.ctx, this.token)
        .subscribe(
        data => {
          this.message.success('updated ' + this.ctx.objectId);
          // this.gotoList();
          this.ctx = data;
          this.initializeAllowed(this.ctx);
        },
        error => {
          this.message.error(error);
        }
        );
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
    const url = environment.rest_ous;
    const queryString = '?q=metadata.name.auto:' + term;
    this.ctxSvc.filter(url, null, queryString, 1)
      .subscribe(res => {
        res.list.forEach(ou => {
          ouNames.push(ou);
        });
        if (ouNames.length > 0) {
          this.ounames = ouNames;
        } else {
          this.ounames = [];
        }
      }, err => {
        this.message.error(err);
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
