import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {Router} from '@angular/router';
import {Ou} from 'app/base/common/model/inge';
import {SearchService} from 'app/base/common/services/search.service';
import {environment} from 'environments/environment';
import {Observable, Subscription} from 'rxjs';
import {AuthenticationService} from '../../base/services/authentication.service';
import {MessagesService} from '../../base/services/messages.service';
import {OrganizationTree2Service, OUTreeFlatNode, OUTreeNode} from '../services/organization-tree2.service';
import {OrganizationsService} from '../services/organizations.service';

@Component({
  selector: 'organization-tree-component',
  templateUrl: 'organization-tree.component.html',
  styleUrls: ['organization-tree.component.scss'],
  providers: [OrganizationTree2Service],
})
export class OrganizationTreeComponent implements OnInit, OnDestroy {
  ous: Ou[] = [];
  ouSearchTerm: string;

  nodeMap: Map<string, OUTreeFlatNode> = new Map<string, OUTreeFlatNode>();
  treeControl: FlatTreeControl<OUTreeFlatNode>;
  treeFlattener: MatTreeFlattener<OUTreeNode, OUTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<OUTreeNode, OUTreeFlatNode>;

  tokenSubscription: Subscription;
  token: string;

  constructor(
    private authenticationService: AuthenticationService,
    private database: OrganizationTree2Service,
    private messagesService: MessagesService,
    private organizationService: OrganizationsService,
    private router: Router,
    private searchService: SearchService,
  ) {}

  ngOnInit() {
    this.tokenSubscription = this.authenticationService.token$.subscribe((data) => this.token = data);
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<OUTreeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.database.dataChange.subscribe((data) => this.dataSource.data = data);
    this.database.initialize();
  }

  ngOnDestroy() {
    this.tokenSubscription.unsubscribe();
  }

  getChildren = (node: OUTreeNode): Observable<OUTreeNode[]> => {
    return node.childrenChange;
  };

  transformer = (node: OUTreeNode, level: number) => {
    if (this.nodeMap.has(node.ouName)) {
      return this.nodeMap.get(node.ouName)!;
    }
    const newNode = new OUTreeFlatNode(node.ouName, node.ouId, level, node.hasChildren, node.parentOUId);
    this.nodeMap.set(node.ouName, newNode);
    return newNode;
  };

  getLevel = (node: OUTreeFlatNode) => {
    return node.level;
  };

  isExpandable = (node: OUTreeFlatNode) => {
    return node.expandable;
  };

  hasChild = (_: number, _nodeData: OUTreeFlatNode) => {
    return _nodeData.expandable;
  };

  loadChildren(node: OUTreeFlatNode) {
    this.database.loadChildren(node.ouName, node.ouId);
  }

  gotoDetails(node) {
    const id: string = node.ouId;
    this.router.navigate(['/organization', id]);
  }

  addNewOrganization() {
    const id = 'new org';
    this.router.navigate(['/organization', id]);
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
    this.ous = [];
  }

  selectOu(ou: Ou) {
    this.router.navigate(['/organization', ou.objectId]);
    this.ous = [];
  }
}
