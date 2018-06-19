/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Component, Injectable, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Elastic4ousService } from '../services/elastic4ous.service';
import { AuthenticationService } from '../../base/services/authentication.service';


export class OUTreeNode {
  childrenChange: BehaviorSubject<OUTreeNode[]> = new BehaviorSubject<OUTreeNode[]>([]);

  get children(): OUTreeNode[] {
    return this.childrenChange.value;
  }

  constructor(public ouName: string,
    public ouId: string,
    public hasChildren: boolean = false,
    public parentOUId: string | null = null) { }
}

export class OUTreeFlatNode {
  constructor(public ouName: string,
    public ouId: string,
    public level: number = 1,
    public expandable: boolean = false,
    public parentOUId: string | null = null) { }
}

@Injectable()
export class OUDB {
  dataChange: BehaviorSubject<OUTreeNode[]> = new BehaviorSubject<OUTreeNode[]>([]);
  nodeMap: Map<string, OUTreeNode> = new Map<string, OUTreeNode>();

  get data(): OUTreeNode[] { return this.dataChange.value; }

  constructor(private elastic: Elastic4ousService) {
    // this.initialize();
  }

  async initialize() {
    let data: any[] = [];
    let mpg = await this.elastic.getOuById('ou_persistent13');
    let ext = await this.elastic.getOuById('ou_persistent22');

    data.push(this.generateNode(mpg._source));
    data.push(this.generateNode(ext._source));
    this.dataChange.next(data);
  }

  getChildren4OU(id) {
    let resp = this.elastic.getChildren4OU(id);
    return resp;
  }

  loadChildren(ouName: string, ouId: string) {
    if (!this.nodeMap.has(ouName)) {
      return;
    }
    const parent = this.nodeMap.get(ouName)!;
    let children = [];
    this.getChildren4OU(ouId)
      .then(resp => {
        children = resp.hits.hits;
        let nodes = children.map(child => this.generateNode(child._source));
        parent.childrenChange.next(nodes);
        this.dataChange.next(this.dataChange.value);
      });
  }

  private generateNode(ou: any): OUTreeNode {
    if (this.nodeMap.has(ou.name)) {
      return this.nodeMap.get(ou.name)!;
    }
    const result = new OUTreeNode(ou.name, ou.objectId, ou.hasChildren);
    this.nodeMap.set(ou.name, result);
    return result;
  }
}

@Component({
  selector: 'app-organization-tree',
  templateUrl: 'organization-tree.component.html',
  styleUrls: ['organization-tree.component.scss'],
  providers: [OUDB]
})
export class OrganizationTreeComponent implements OnInit, OnDestroy{
  ounames: any[] = [];
  subscription: Subscription;
  token;
  selected: any;
  searchTerm;
  nodeMap: Map<string, OUTreeFlatNode> = new Map<string, OUTreeFlatNode>();
  treeControl: FlatTreeControl<OUTreeFlatNode>;
  treeFlattener: MatTreeFlattener<OUTreeNode, OUTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<OUTreeNode, OUTreeFlatNode>;

  constructor(private database: OUDB, private router: Router, private loginService: AuthenticationService,
      private elastic: Elastic4ousService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);

    this.treeControl = new FlatTreeControl<OUTreeFlatNode>(this.getLevel, this.isExpandable);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });

    database.initialize();
  }

  ngOnInit() {
    this.subscription = this.loginService.token$.subscribe(token => {
      this.token = token;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getChildren = (node: OUTreeNode): Observable<OUTreeNode[]> => { return node.childrenChange; };

  transformer = (node: OUTreeNode, level: number) => {
    if (this.nodeMap.has(node.ouName)) {
      return this.nodeMap.get(node.ouName)!;
    }
    let newNode = new OUTreeFlatNode(node.ouName, node.ouId, level, node.hasChildren, node.parentOUId);
    this.nodeMap.set(node.ouName, newNode);
    return newNode;
  }

  getLevel = (node: OUTreeFlatNode) => { return node.level; };

  isExpandable = (node: OUTreeFlatNode) => { return node.expandable; };

  hasChild = (_: number, _nodeData: OUTreeFlatNode) => { return _nodeData.expandable; };

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

  onSelect(ou: any) {
    const id: string = ou.objectId;
    this.router.navigate(['/organization', id]);
  }

  isSelected(ou) {
    return true;
  }

  getNames(a) {
    const ouNames: any[] = [];
    this.elastic.ous4auto(a, (names) => {
      names.forEach(name => ouNames.push(name));
      if (ouNames.length > 0) {
        this.ounames = ouNames;
      } else {
        this.ounames = [];
      }
    });
  }

  close() {
    this.searchTerm = '';
    this.ounames = [];
  }

  select(term) {
    this.searchTerm = term.metadata.name;
    this.router.navigate(['/organization', term.objectId]);
    this.ounames = [];
  }

}
