import {Injectable} from '@angular/core';
import {Ou} from 'app/base/common/model/inge';
import {localAdminOus} from 'app/base/common/model/query-bodies';
import {BehaviorSubject, lastValueFrom, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {MessagesService} from '../../base/services/messages.service';
import {OrganizationsService} from './organizations.service';

export class OuTreeNode {
  childrenChange: BehaviorSubject<OuTreeNode[]> = new BehaviorSubject<OuTreeNode[]>([]);

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
    public selected: boolean = false,
    public level: number = 1,
    public expandable: boolean = false,
    public parentOuId: string | null = null,
  ) {}
}

@Injectable({
  providedIn: 'root',
})
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
    const ouTreeNodes: OuTreeNode[] = [];

    try {
      const topLevelOus: Ou[] = await lastValueFrom(this.getTopLevelOus());
      topLevelOus.forEach(
        (ou: Ou) => ouTreeNodes.push(this.generateNode(ou))
      );
      this.dataChange.next(ouTreeNodes);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async initializeForLocalAdmin(ouIds: string[]) {
    const ouTreeNodes: OuTreeNode[] = [];
    const body = localAdminOus;
    body.query.bool.filter.terms['objectId'] = ouIds;

    try {
      const data: {list: Ou[], records: number} = await lastValueFrom(this.organizationsService.query(this.ousPath, null, body));
      data.list.forEach(
        (ou: Ou) => ouTreeNodes.push(this.generateNode(ou))
      );
      this.dataChange.next(ouTreeNodes);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  async loadChildren(ouId: string) {
    if (!this.nodeMap.has(ouId)) {
      return;
    }

    const parent: OuTreeNode = this.nodeMap.get(ouId)!;
    try {
      const children: Ou[] = await lastValueFrom(this.getChildren4Ou(ouId));
      const ouTreeNode: OuTreeNode[] = children.map((child: Ou) => this.generateNode(child));
      parent.childrenChange.next(ouTreeNode);
      this.dataChange.next(this.dataChange.value);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  private generateNode(ou: Ou): OuTreeNode {
    if (this.nodeMap.has(ou.objectId)) {
      return this.nodeMap.get(ou.objectId)!;
    }

    const ouTreeNode: OuTreeNode = new OuTreeNode(ou.name, ou.publicStatus, ou.objectId, ou.hasChildren);
    this.nodeMap.set(ou.objectId, ouTreeNode);

    return ouTreeNode;
  }

  private getChildren4Ou(ouId: string): Observable<Ou[]> {
    return this.organizationsService.listChildren4Ou(ouId, null);
  }

  private getTopLevelOus(): Observable<Ou[]> {
    return this.organizationsService.getTopLevelOus(null);
  }
}

