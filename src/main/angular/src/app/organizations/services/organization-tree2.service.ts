import {Injectable} from '@angular/core';
import {Ou} from 'app/base/common/model/inge';
import {localAdminOus} from 'app/base/common/model/query-bodies';
import {BehaviorSubject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {MessagesService} from '../../base/services/messages.service';
import {OrganizationsService} from './organizations.service';

export class OuTreeNode {
  childrenChange: BehaviorSubject<OuTreeNode[]> = new BehaviorSubject<OuTreeNode[]>([]);

  get children(): OuTreeNode[] {
    return this.childrenChange.value;
  }

  constructor(
    public ouName: string,
    public ouStatus: string,
    public ouId: string,
    public hasChildren: boolean = false,
    public parentOuId: string | null = null,
  ) {}
}

export class OuTreeFlatNode {
  constructor(
    public ouName: string,
    public ouStatus: string,
    public ouId: string,
    public level: number = 1,
    public expandable: boolean = false,
    public parentOuId: string | null = null,
  ) {}
}

@Injectable()
export class OrganizationTree2Service {
  ousPath: string = environment.restOus;

  dataChange: BehaviorSubject<OuTreeNode[]> = new BehaviorSubject<OuTreeNode[]>([]);
  nodeMap: Map<string, OuTreeNode> = new Map<string, OuTreeNode>();

  get data(): OuTreeNode[] {
    return this.dataChange.value;
  }

  constructor(
    private messagesService: MessagesService,
    private organizationsService: OrganizationsService,
  ) {}

  async initialize() {
    const treeData: any[] = [];

    try {
      const topLevelOus = await this.getTopLevelOus();
      topLevelOus.forEach((ou: any) => treeData.push(this.generateNode(ou)));
      this.dataChange.next(treeData);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  initializeForLocalAdmin(ouIds: string[]) {
    const treeData: any[] = [];
    const body = localAdminOus;
    body.query.bool.filter.terms['objectId'] = ouIds;
    try {
      this.organizationsService.query(this.ousPath, null, body)
        .subscribe({
          next: (data) => {
            const ous: Ou[] = [];
            data.list.forEach((ou: Ou) => ous.push(ou));
            ous.forEach((ou: any) => treeData.push(this.generateNode(ou)));
            this.dataChange.next(treeData);
          },
        });
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  private getTopLevelOus() {
    const tops = this.organizationsService.getTopLevelOus(null).toPromise();
    return tops;
  }

  private getChildren4Ou(id: string) {
    const resp = this.organizationsService.listChildren4Ou(id, null).toPromise();
    return resp;
  }

  loadChildren(ouName: string, ouId: string) {
    if (!this.nodeMap.has(ouName)) {
      return;
    }

    const parent = this.nodeMap.get(ouName)!;
    let children = [];

    this.getChildren4Ou(ouId)
      .then((resp) => {
        children = resp;
        const nodes = children.map((child) => this.generateNode(child));
        parent.childrenChange.next(nodes);
        this.dataChange.next(this.dataChange.value);
      }).catch((error) => {
        this.messagesService.error(error);
      });
  }

  private generateNode(ou: any): OuTreeNode {
    if (this.nodeMap.has(ou.name)) {
      return this.nodeMap.get(ou.name)!;
    }

    const response = new OuTreeNode(ou.name, ou.publicStatus, ou.objectId, ou.hasChildren);
    this.nodeMap.set(ou.name, response);

    return response;
  }
}

