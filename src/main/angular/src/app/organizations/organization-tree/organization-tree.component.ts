import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {Router} from '@angular/router';
import {Ou, User} from 'app/base/common/model/inge';
import {SearchService} from 'app/base/common/services/search.service';
import {AuthenticationService} from 'app/base/services/authentication.service';
import {environment} from 'environments/environment';
import {Observable, Subscription} from 'rxjs';
import {MessagesService} from '../../base/services/messages.service';
import {OrganizationTree2Service, OuTreeFlatNode, OuTreeNode} from '../services/organization-tree2.service';
import {OrganizationsService} from '../services/organizations.service';

@Component({
  selector: 'organization-tree-component',
  templateUrl: 'organization-tree.component.html',
  styleUrls: ['organization-tree.component.scss'],
  providers: [OrganizationTree2Service],
})
export class OrganizationTreeComponent implements OnInit {
  ousPath: string = environment.restOus;

  ous: Ou[] = [];
  ouSearchTerm: string;

  dataSource: MatTreeFlatDataSource<OuTreeNode, OuTreeFlatNode>;
  nodeMap: Map<string, OuTreeFlatNode> = new Map<string, OuTreeFlatNode>();
  treeControl: FlatTreeControl<OuTreeFlatNode>;
  treeFlattener: MatTreeFlattener<OuTreeNode, OuTreeFlatNode>;

  transformer = (node: OuTreeNode, level: number) => {
    if (this.nodeMap.has(node.ouName)) {
      return this.nodeMap.get(node.ouName)!;
    }
    const newNode = new OuTreeFlatNode(node.ouName, node.ouStatus, node.ouId, level, node.hasChildren, node.parentOuId);
    this.nodeMap.set(node.ouName, newNode);
    return newNode;
  };

  hasChild = (_: number, nodeData: OuTreeFlatNode) => {
    return nodeData.expandable;
  };

  adminSubscription: Subscription;
  isAdmin: boolean;
  userSubscription: Subscription;
  loggedInUser: User;

  constructor(
    private authenticationService: AuthenticationService,
    private database: OrganizationTree2Service,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data) => this.isAdmin = data);
    this.userSubscription = this.authenticationService.loggedInUser$.subscribe((data) => this.loggedInUser = data);

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<OuTreeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.database.dataChange.subscribe((data) => this.dataSource.data = data);
    if (this.isAdmin) {
      this.database.initialize();
    } else if (this.loggedInUser != null) {
      this.database.initializeForLocalAdmin(this.loggedInUser.topLevelOuIds);
    }
  }

  private getChildren = (node: OuTreeNode): Observable<OuTreeNode[]> => {
    return node.childrenChange;
  };

  private getLevel = (node: OuTreeFlatNode) => {
    return node.level;
  };

  private isExpandable = (node: OuTreeFlatNode) => {
    return node.expandable;
  };

  loadChildren(node: OuTreeFlatNode) {
    this.database.loadChildren(node.ouName, node.ouId);
  }

  gotoOu(node: { ouId: string; }) {
    this.router.navigate(['/organization', node.ouId]);
  }

  addNewOu() {
    this.router.navigate(['/organization', 'new org']);
  }

  getOus(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedOus(convertedSearchTerm);
    } else {
      this.closeOus();
    }
  }

  private returnSuggestedOus(term: string) {
    const ous: Ou[] = [];
    const queryString = '?q=metadata.name.auto:' + term;
    this.organizationsService.filter(this.ousPath, null, queryString, 1)
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
    this.ous = [];
  }

  selectOu(ou: Ou) {
    this.router.navigate(['/organization', ou.objectId]);
    this.ous = [];
  }
}
