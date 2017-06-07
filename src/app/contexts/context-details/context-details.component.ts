import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { ContextsService } from '../services/contexts.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { MessagesService } from '../../base/services/messages.service';
import { genres } from './context.template';
import { Affiliation } from '../../base/common/model';

@Component({
  selector: 'app-context-details',
  templateUrl: './context-details.component.html',
  styleUrls: ['./context-details.component.scss']
})
export class ContextDetailsComponent implements OnInit, OnDestroy {

  token: string;
  ctx: any;
  isNewCtx: boolean = false;
  subscription: Subscription;
  loginSubscription: Subscription;
  genres2display: string[] = [];
  selectedGenre: string;
  selectedGenres: string[] = [];
  selectedOu: any;

  constructor(private ctxSvc: ContextsService,
    private router: Router,
    private route: ActivatedRoute,
    private login: AuthenticationService,
    private message: MessagesService) { }

  ngOnInit() {
    this.ctx = this.route.snapshot.data["ctx"];
    if (this.ctx.name == "new ctx") {
      this.isNewCtx = true;
    }
    this.genres2display = Object.keys(genres).filter(val => val.match(/^[A-Z]/));
  }

  ngOnDestroy() {
  }

  getSelectedCtx(id) {
    this.ctxSvc.getContext(id, this.token)
      .subscribe(ctx => {
        this.ctx = ctx;
      },
      error => {
        this.message.error(error);
      });
  }

  addGenres(selected) {
    this.selectedGenre = selected;
    //this.selectedGenres = JSON.stringify(selected, null, 1);
    this.selectedGenres.push(this.selectedGenre);
  }

  removeGenres(selected) {
    this.selectedGenres = selected;
    this.selectedGenre;
  }

  activateContext(ctx) {
    this.ctx = ctx;
    if (this.ctx.state == 'OPENED') {
      this.ctx.state = 'CLOSED';
    } else {
      this.ctx.state = 'OPENED';
    }
  }

  gotoList() {
    this.router.navigate(['/contexts']);
  }

  save(ctx2save) {
    this.ctx = ctx2save;
    if (this.isNewCtx) {
      if (this.selectedOu != null) {
        let ou_id = this.selectedOu.reference.objectId;
        let aff = new Affiliation();
        aff.objectId = ou_id;
        this.ctx.responsibleAffiliations.push(aff);
      }
      this.ctxSvc.postContext(this.ctx, this.token)
        .subscribe(
        data => {
          this.message.success('added new context ' + data);
          this.gotoList();
          this.ctx = null;
        },
        error => {
          this.message.error(error);
        }
        );

    } else {
      this.message.success("updating " + this.ctx.reference.objectId);
      this.ctxSvc.putContext(this.ctx, this.token)
        .subscribe(
        data => {
          this.message.success('updated ' + this.ctx.reference.objectId + ' ' + data);
          this.gotoList();
          this.ctx = null;
        },
        error => {
          this.message.error(error);
        }
        );
    }
  }
}
