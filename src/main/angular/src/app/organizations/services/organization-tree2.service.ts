import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {allTopLevelOUs} from '../../base/common/model/query-bodies';
import {MessagesService} from '../../base/services/messages.service';
import {OrganizationsService} from './organizations.service';

export class OUTreeNode {
  childrenChange: BehaviorSubject<OUTreeNode[]> = new BehaviorSubject<OUTreeNode[]>([]);

  get children(): OUTreeNode[] {
    return this.childrenChange.value;
  }

  constructor(
    public ouName: string,
    public ouId: string,
    public hasChildren: boolean = false,
    public parentOUId: string | null = null,
  ) {}
}

export class OUTreeFlatNode {
  constructor(
    public ouName: string,
    public ouId: string,
    public level: number = 1,
    public expandable: boolean = false,
    public parentOUId: string | null = null,
  ) {}
}

@Injectable()
export class OrganizationTree2Service {
  dataChange: BehaviorSubject<OUTreeNode[]> = new BehaviorSubject<OUTreeNode[]>([]);
  nodeMap: Map<string, OUTreeNode> = new Map<string, OUTreeNode>();

  get data(): OUTreeNode[] {
    return this.dataChange.value;
  }

  constructor(
    private messagesService: MessagesService,
    private organizationService: OrganizationsService,
  ) {}

  async initialize() {
    const data: any[] = [];
    try {
      /*
      const mpg = await this.service.getOuById('ou_persistent13', null).toPromise();
      const ext = await this.service.getOuById('ou_persistent22', null).toPromise();
      data.push(this.generateNode(mpg));
      data.push(this.generateNode(ext));
      */
      const tlous = await this.getTopLevelOUs();
      tlous.list.forEach((ou) => data.push(this.generateNode(ou)));
      this.dataChange.next(data);
    } catch (e) {
      this.messagesService.error(e);
    }
  }

  getTopLevelOUs() {
    const body = allTopLevelOUs;
    const tops = this.organizationService.query(environment.restOus, null, body).toPromise();
    return tops;
  }

  getChildren4OU(id) {
    const resp = this.organizationService.listChildren4Ou(id, null).toPromise();
    return resp;
  }

  loadChildren(ouName: string, ouId: string) {
    if (!this.nodeMap.has(ouName)) {
      return;
    }
    const parent = this.nodeMap.get(ouName)!;
    let children = [];
    this.getChildren4OU(ouId)
      .then((resp) => {
        children = resp;
        const nodes = children.map((child) => this.generateNode(child));
        parent.childrenChange.next(nodes);
        this.dataChange.next(this.dataChange.value);
      }).catch((error) => {
        this.messagesService.error(error);
      });
  }

  private generateNode(ou: any): OUTreeNode {
    if (this.nodeMap.has(ou.name)) {
      return this.nodeMap.get(ou.name)!;
    }
    const response = new OUTreeNode(ou.name, ou.objectId, ou.hasChildren);
    this.nodeMap.set(ou.name, response);
    return response;
  }
}

