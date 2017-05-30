import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { AnotherService } from '../services/another.service';
import { User } from '../../base/common/model';

@Component({
  selector: 'app-another-list',
  templateUrl: './another-list.component.html',
  styleUrls: ['./another-list.component.scss']
})
export class AnotherListComponent implements OnInit {

  token: string;
  users: Observable<User[]>;
  singleUser$: Observable<User>;

  constructor(
    private another: AnotherService
    ) { }

  ngOnInit() {
    this.users = this.another.users;
    this.singleUser$ = this.another.users
      .map(users => users.find(user => user.userid === 'boosen'));
    
    this.another.getAll(this.token);
    this.another.getUser('boosen', this.token);
  }

  deleteUser(user: User) {
    this.another.delete(user, this.token);
  }
}
