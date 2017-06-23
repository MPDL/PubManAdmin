import { Injectable } from '@angular/core';

import { ElasticService } from '../../base/services/elastic.service';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class ElasticSearchService extends ElasticService {

  constructor(public message: MessagesService) {
    super(message);
   }

   genreAggregation(callback): any {
        return this.client.search({
            index: "db_items",
            body: '{"size":0, "aggs" : { "genres" : { "terms" : { "field" : "metadata.genre", "size" : 10, "order" : { "_count" : "desc" }}}}}'
        }, (err, res) => {
            if (err) {
                this.message.error(err);
            } else {
                let genres = Array<any>();
                res.aggregations.genres.buckets.forEach((genre) => {
                    genres.push(genre);
                });
                callback(genres);
            }
        });
    }

    publisherAggregation(callback): any {
        return this.client.search({
            index: "db_items",
            body: '{"size":0, "aggs" : { "publishers" : { "nested" : { "path" : "metadata.sources" }, "aggs" : { "names" : { "terms" : { "field" : "metadata.sources.publishingInfo.publisher.sorted", "size" : 10 } } } } } }'
        }, (err, res) => {
            if (err) {
                this.message.error(err);
            } else {
                let publishers = Array<any>();
                res.aggregations.publishers.names.buckets.forEach((publisher) => {
                    publishers.push(publisher);
                });
                callback(publishers);
            }
        });
    }

    itemsPerYear(callback): any {
        return this.client.search({
            index: "db_items",
            body: '{"size":0, "aggs" : { "items_over_time" : { "date_histogram" : { "field" : "creationDate", "interval" : "year"}}}}'
        }, (err, res) => {
            if (err) {
                this.message.error(err);
            } else {
                let buckets = Array<any>();
                res.aggregations.items_over_time.buckets.forEach((bucket) => {
                    buckets.push(bucket);
                });
                callback(buckets);
            }
        });
    }

}
