import {Injectable} from '@angular/core';
import {Ou} from 'app/base/common/model/inge';
import {localAdminOus} from 'app/base/common/model/query-bodies';
import {BehaviorSubject, lastValueFrom, Observable} from 'rxjs';
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
      const topLevelOus: Ou[] = await lastValueFrom(this.getTopLevelOus());
      topLevelOus.forEach(
        (ou: Ou) => treeData.push(this.generateNode(ou))
      );
      this.dataChange.next(treeData);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  initializeForLocalAdmin(ouIds: string[]) {
    const treeData: any[] = [];
    const body = localAdminOus;
    body.query.bool.filter.terms['objectId'] = ouIds;
    this.organizationsService.query(this.ousPath, null, body)
      .subscribe({
        next: (data: {list: Ou[], records: number}) => {
          data.list.forEach(
            (ou: Ou) => treeData.push(this.generateNode(ou))
          );
          this.dataChange.next(treeData);
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private getTopLevelOus(): Observable<Ou[]> {
    return this.organizationsService.getTopLevelOus(null);
  }

  private getChildren4Ou(id: string): Observable<Ou[]> {
    return this.organizationsService.listChildren4Ou(id, null);
  }

  loadChildren(ouName: string, ouId: string) {
    if (!this.nodeMap.has(ouName)) {
      return;
    }

    const parent: OuTreeNode = this.nodeMap.get(ouName)!;
    this.getChildren4Ou(ouId)
      .subscribe({
        next: (data: Ou[]) => {
          const ouTreeNode: OuTreeNode[] = data.map((child: Ou) => this.generateNode(child));
          parent.childrenChange.next(ouTreeNode);
          this.dataChange.next(this.dataChange.value);
        },
        error: (e) => this.messagesService.error(e),
      });
  }

  private generateNode(ou: Ou): OuTreeNode {
    if (this.nodeMap.has(ou.name)) {
      return this.nodeMap.get(ou.name)!;
    }

    const ouTreeNode: OuTreeNode = new OuTreeNode(ou.name, ou.publicStatus, ou.objectId, ou.hasChildren);
    this.nodeMap.set(ou.name, ouTreeNode);

    return ouTreeNode;
  }
}

