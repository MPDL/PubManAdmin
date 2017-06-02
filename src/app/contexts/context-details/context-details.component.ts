import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { ContextsService } from '../services/contexts.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { MessagesService } from '../../base/services/messages.service';
import { genres } from './context.template';

@Component({
  selector: 'app-context-details',
  templateUrl: './context-details.component.html',
  styleUrls: ['./context-details.component.scss']
})
export class ContextDetailsComponent implements OnInit, OnDestroy {

  token: string;
  ctx: any;
  subscription: Subscription;
  loginSubscription: Subscription;
  genres2display: string[] = [];
  selected: string;
  selectedGenres: string;
  // genres: typeof genres = genres;

  
  constructor(private ctxSvc: ContextsService,
    private router: Router,
    private route: ActivatedRoute,
    private login: AuthenticationService,
    private message: MessagesService) { }

  ngOnInit() {
    /*
    this.subscription = this.route.params
      .subscribe(params => {
        this.loginSubscription = this.login.token$.subscribe(token => {
          this.token = token;
        });
        let id = params['id'];
        
          //id = id.substring(id.indexOf('_') + 1);
          this.getSelectedCtx(id);
      });
      */
      this.ctx = this.route.snapshot.data["ctx"];
      // let x = genres;
      // let y = Object.keys(genres);
      this.genres2display = Object.keys(genres).filter(val => val.match(/^[A-Z]/));

  }

  ngOnDestroy() {
    // this.subscription.unsubscribe();
    // this.loginSubscription.unsubscribe();
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
    this.selected = selected;
    this.selectedGenres = JSON.stringify(selected, null, 1);
  }
}
