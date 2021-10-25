import {Injectable} from '@angular/core';

import {ElasticService} from '../../services/elastic.service';
import {MessagesService} from '../../services/messages.service';
import {ConnectionService} from '../../services/connection.service';

@Injectable()
export class ElasticSearchService extends ElasticService {
  constructor(messages: MessagesService,
    conn: ConnectionService) {
    super(messages, conn);
  }

  bucketAggregation(index, body, nested, callback): any {
    return this.client.search({
      index: index,
      body: body,
    }, (err, res) => {
      if (err) {
        this.messages.error(err);
      } else {
        const buckets = Array<any>();
        if (nested) {
          res.aggregations.name1.name2.buckets.forEach((bucket) => {
            buckets.push(bucket);
          });
        } else {
          res.aggregations.name1.buckets.forEach((bucket) => {
            buckets.push(bucket);
          });
        }
        callback(buckets);
      }
    });
  }

  buckets(index, body, nested): any[] {
    const buckets = Array<any>();
    this.client.search({
      index: index,
      body: body,
    }, (err, res) => {
      if (err) {
        this.messages.error(err);
      } else {
        if (nested) {
          res.aggregations.name1.name2.buckets.forEach((bucket) => {
            buckets.push(bucket);
          });
        } else {
          res.aggregations.name1.buckets.forEach((bucket) => {
            buckets.push(bucket);
          });
        }
      }
    });
    return buckets;
  }

  getTheNestedObject(obj, key2find, callback): any {
    let found;
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

  getMappingFields(alias, type): Array<string> {
    const fields = Array<string>();
    this.client.indices.getFieldMapping({
      index: alias,
      fields: '*',
      includeDefaults: false,
    }, (error, response) => {
      if (error) {
        this.messages.error(error);
      } else {
        let mapping;
        this.getTheNestedObject(response, type, (found) => mapping = found);
        // let mapping = JSON.parse(JSON.stringify(response[index].mappings[type]));

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

  getIndex4Alias(alias): any {
    this.client.cat.aliases({
      format: 'json',
      name: alias,
    }, (err, res) => {
      if (err) {
        this.messages.error(err);
      } else {
        const indexName = res[0].index;
        return indexName;
      }
    });
  }
}
