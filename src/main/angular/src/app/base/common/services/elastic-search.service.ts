import {Injectable} from '@angular/core';
import {ConnectionService} from '../../services/connection.service';
import {ElasticService} from '../../services/elastic.service';
import {MessagesService} from '../../services/messages.service';

@Injectable()
export class ElasticSearchService extends ElasticService {
  constructor(
    protected connectionService: ConnectionService,
    protected messagesService: MessagesService,
  ) {
    super(connectionService);
  }

  async buckets(index: string, body: any, nested: boolean): Promise<any[]> {
    const buckets = [];

    try {
      const response = await this.client.search({
        index: index,
        body: body,
      });
      if (nested) {
        response.aggregations.name1.name2.buckets.forEach((bucket: any) => {
          buckets.push(bucket);
        });
      } else {
        response.aggregations.name1.buckets.forEach((bucket: any) => {
          buckets.push(bucket);
        });
      }
    } catch (error) {
      this.messagesService.error(error);
    }

    return buckets;
  }

  getMappingFields(alias: string, type: string): string[] {
    const fields:string[] = [];
    this.client.indices.getFieldMapping({
      index: alias,
      fields: '*',
      includeDefaults: false,
    }, (error, response) => {
      if (error) {
        this.messagesService.error(error);
      } else {
        let mapping: any;
        this.getTheNestedObject(response, type, (found: any) => mapping = found);
        JSON.parse(JSON.stringify(mapping), (key, value: string) => {
          if (key === 'full_name') {
            if (!value.startsWith('_')) {
              fields.push(value);
            }
          }
        });
        fields.sort((a, b) => {
          if (a < b) {
            return -1;
          } else if (a > b) {
            return 1;
          } else {
            return 0;
          }
        });
      }
    });

    return fields;
  }

  private getTheNestedObject(obj: { [x: string]: any; }, key2find: string, callback: { (found: any): any; (arg0: any): void; }): any {
    let found: any;
    Object.keys(obj).forEach((key) => {
      if (key === key2find) {
        found = obj[key];
        callback(found);
      } else {
        found = this.getTheNestedObject(obj[key], key2find, callback);
        if (found) {
          callback(found);
        }
      }
    });
  }
}
