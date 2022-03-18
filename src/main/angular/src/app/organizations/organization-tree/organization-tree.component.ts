import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {ActivatedRoute, Router} from '@angular/router';
import {Ou, User} from 'app/base/common/model/inge';
import {ous4autoSelect} from 'app/base/common/model/query-bodies';
import {SearchService} from 'app/base/common/services/search.service';
import {AuthenticationService} from 'app/base/services/authentication.service';
import {environment} from 'environments/environment';
import {lastValueFrom, Observable, Subscription} from 'rxjs';
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

  hasChildAndIsSelected = (_: number, nodeData: OuTreeFlatNode) => {
    return nodeData.expandable && nodeData.selected;
  };

  hasChildAndIsNotSelected = (_: number, nodeData: OuTreeFlatNode) => {
    return nodeData.expandable && !nodeData.selected;
  };

  hasNotChildAndIsSelected = (_: number, nodeData: OuTreeFlatNode) => {
    return !nodeData.expandable && nodeData.selected;
  };

  hasNotChildAndIsNotSelected = (_: number, nodeData: OuTreeFlatNode) => {
    return !nodeData.expandable && !nodeData.selected;
  };

  private getChildren = (node: OuTreeNode): Observable<OuTreeNode[]> => {
    return node.childrenChange;
  };

  private getLevel = (node: OuTreeFlatNode) => {
    return node.level;
  };

  private isExpandable = (node: OuTreeFlatNode) => {
    return node.expandable;
  };

  private transformer = (node: OuTreeNode, level: number) => {
    if (this.nodeMap.has(node.ouId)) {
      return this.nodeMap.get(node.ouId)!;
    }
    const newNode = new OuTreeFlatNode(node.ouName, node.ouStatus, node.ouId, false, level, node.hasChildren, node.parentOuId);
    this.nodeMap.set(node.ouId, newNode);
    return newNode;
  };

  adminSubscription: Subscription;
  isAdmin: boolean;
  databaseSubscription: Subscription;
  userSubscription: Subscription;
  loggedInUser: User;

  constructor(
    private authenticationService: AuthenticationService,
    private database: OrganizationTree2Service,
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
  ) {}

  ngOnInit() {
    this.adminSubscription = this.authenticationService.isAdmin$.subscribe((data: boolean) => this.isAdmin = data);
    this.userSubscription = this.authenticationService.loggedInUser$.subscribe((data: User) => this.loggedInUser = data);

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<OuTreeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.databaseSubscription = this.database.dataChange.subscribe((data) => this.dataSource.data = data);

    if (this.isAdmin) {
      this.database.initialize();
    } else {
      this.database.initializeForLocalAdmin(this.loggedInUser.topLevelOuIds);
    }

    const ouId: string = this.route.snapshot.params['ouId'];

    if (ouId != null) {
      this.expandNode(ouId);
      this.selectNode(ouId);
    }
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.databaseSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  addNewOu() {
    this.router.navigate(['/organization', 'new ou']);
  }

  closeOus() {
    this.ouSearchTerm = '';
    this.ous = [];
  }

  collapsAll() {
    this.treeControl.collapseAll();
  }

  getOus(term: string) {
    const convertedSearchTerm = this.searchService.convertSearchTerm(term);
    if (convertedSearchTerm.length > 0) {
      this.returnSuggestedOus(convertedSearchTerm);
    } else {
      this.closeOus();
    }
  }

  gotoOu(node: { ouId: string; }) {
    this.router.navigate(['/organization', node.ouId]);
  }

  loadChildren(node: OuTreeFlatNode) {
    this.database.loadChildren(node.ouId);
  }

  selectOu(ou: Ou) {
    this.router.navigate(['/organization', ou.objectId]);
    this.ous = [];
  }

  private async expandNode(ouId: string) {
    const maxRepeat: number = 5;
    let countRepeat: number = 0;
    try {
      const data: string = await lastValueFrom(this.organizationsService.getIdPath(ouId, null));
      const path: string[] = data.split(',');
      for (let i = path.length - 1; i > 0; i--) {
        if (!this.isAdmin && i === path.length - 1) {
          continue;
        }
        if (this.nodeMap.has(path[i])) {
          countRepeat = 0;
          const node: OuTreeFlatNode = this.nodeMap.get(path[i]);
          this.loadChildren(node);
          this.treeControl.expand(node);
        } else {
          countRepeat++;
          if (countRepeat < maxRepeat) {
            i++;
            await this.sleep(500);
          } else {
            break;
          }
        }
      }
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  private async selectNode(ouId: string) {
    let node: OuTreeFlatNode = null;
    const maxRepeat: number = 5;
    let countRepeat = 0;
    while (node == null) {
      node = this.nodeMap.get(ouId);
      if (node != null) {
        const newNode = new OuTreeFlatNode(node.ouName, node.ouStatus, node.ouId, true, node.level, node.expandable, node.parentOuId);
        this.nodeMap.set(node.ouId, newNode);
        this.database.dataChange.next(this.database.dataChange.value);
      } else {
        countRepeat++;
        if (countRepeat < maxRepeat) {
          await this.sleep(700);
        } else {
          break;
        }
      }
    }
  }

  private returnSuggestedOus(ouName: string) {
    if (this.isAdmin) {
      const queryString = '?q=metadata.name.auto:' + ouName;
      this.organizationsService.filter(this.ousPath, null, queryString, 1)
        .subscribe({
          next: (data: {list: Ou[], records: number}) => this.ous = data.list,
          error: (e) => this.messagesService.error(e),
        });
    } else {
      this.organizationsService.getallChildOus(this.loggedInUser.topLevelOuIds, null, null)
        .subscribe({
          next: (data: Ou[]) => {
            const allOuIds: string[] = [];
            data.forEach((ou: Ou) => {
              allOuIds.push(ou.objectId);
            });
            const body = ous4autoSelect;
            body.query.bool.filter.terms['objectId'] = allOuIds;
            body.query.bool.must.term['metadata.name.auto'] = ouName.toLowerCase();
            this.organizationsService.query(this.ousPath, null, body)
              .subscribe({
                next: (data: {list: Ou[], records: number}) => this.ous = data.list,
                error: (e) => this.messagesService.error(e),
              });
          },
          error: (e) => this.messagesService.error(e),
        });
    }
  }

  private sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
