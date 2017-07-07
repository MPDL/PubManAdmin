import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GrantsComponent } from '../grants/grants.component';
import { User, Grant, Affiliation } from '../../base/common/model';
import { UsersService } from '../services/users.service';
import { MessagesService } from '../../base/services/messages.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { Elastic4usersService } from '../services/elastic4users.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy {

  resettedPassword: string = "hard2Remember";
  selected: User;
  ous: any[];
  selectedOu: any;
  isNewUser: boolean = false;
  isNewGrant: boolean = false;
  grants2remove: boolean = false;
  selectedGrant: Grant;
  selectedGrants: Grant[] = [];
  grantsToRemove: string;

  subscription: Subscription;
  token: string;
  tokenSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private messageService: MessagesService,
    private loginService: AuthenticationService,
    private elasticService: Elastic4usersService
  ) { }

  ngOnInit() {
    this.tokenSubscription = this.loginService.token$.subscribe(token => {
      this.token = token;
    });

    this.selected = this.route.snapshot.data['user'];
    if (this.selected.userid == "new user") {
      this.isNewUser = true;
    }
    this.listOuNames();

  }

  listOuNames() {
    this.elasticService.listOuNames("parent", "persistent13", (names) => {
      this.ous = names;
      this.ous.sort((a, b) => {
        if (a < b) return -1;
        else if (a > b) return 1;
        else return 0;
      });
    });
  }

  onChangeOu(val) {
    this.selectedOu = val;
  }

  selectOuByKey(val) {
    confirm("you pressed " + val);
    console.log("you pressed " + val);
  }

  ngOnDestroy() {
    this.tokenSubscription.unsubscribe();
  }

  addGrant() {
    this.isNewGrant = true;
  }

  deleteGrant(grant) {
    this.grants2remove = true;
    this.selectedGrant = grant;
    this.selectedGrants.push(grant);
    this.grantsToRemove = JSON.stringify(this.selectedGrants);
  }

  gotoList() {
    let userId = this.selected ? this.selected.userid : null;
    this.router.navigate(['/users', { id: userId }]);
  }

  resetPassword(user) {
    this.selected = user;
    if (this.selected.name && this.selected.name != "") {
      this.selected.password = this.selected.name.split('').reverse().join('');
    } else {
      this.selected.password = this.resettedPassword;
      this.messageService.warning("password was reset to: " + this.resettedPassword);
    }
  }

  activateUser(user) {
    this.selected = user;
    if (this.selected.active == true) {
      this.usersService.deactivate(this.selected, this.token)
        .subscribe(user => {
          this.selected = user;
          this.messageService.success("Deactivated " + this.selected.reference.objectId);
        }, error => {
          this.messageService.error(error);
        });
    } else {
      this.usersService.activate(this.selected, this.token)
        .subscribe(user => {
          this.selected = user;
          this.messageService.success("Activated " + this.selected.reference.objectId);
        }, error => {
          this.messageService.error(error);
        });
    }
  }

  save(user2save) {
    this.selected = user2save;
    if (this.isNewUser) {
      if (this.selectedOu != null) {
        let ou_id = this.selectedOu.reference.objectId;
        let aff = new Affiliation();
        aff.objectId = ou_id;
        this.selected.affiliations.push(aff);
      } else {
        this.messageService.warning("you MUST select an organization");
        return;
      }
      this.usersService.postUser(this.selected, this.token)
        .subscribe(
        data => {
          this.messageService.success('added new user ' + data);
          this.gotoList();
          this.selected = null;
        },
        error => {
          this.messageService.error(error);
        }
        );

    } else {
      this.messageService.success("updating " + this.selected.userid);
      this.usersService.putUser(this.selected, this.token)
        .subscribe(
        data => {
          this.messageService.success('updated ' + this.selected.userid + ' ' + data);
          this.gotoList();
          this.selected = null;
          this.isNewGrant = false;
        },
        error => {
          this.messageService.error(error);
        }
        );
    }
  }

      removeGrants() {
        this.usersService.removeGrants(this.selected, this.selectedGrants, this.token).subscribe(user => {
          this.selected = user;
            this.messageService.success("removed Grants from " + this.selected.userid);
            /*
            this.selectedGrants.forEach((g) => {
              let i = this.selected.grants.indexOf(g);
              this.selected.grants.splice(i, 1);
            });
            */
            this.selectedGrants = null;
            this.grants2remove = false;
        }, error => {
            this.messageService.error(error);
        });
    }

}
