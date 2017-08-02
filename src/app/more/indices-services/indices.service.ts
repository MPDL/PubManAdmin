import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Client, SearchResponse, GetResponse, Cat } from 'elasticsearch';
import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service';
import { ElasticService } from '../../base/services/elastic.service';

@Injectable()
export class IndicesService extends ElasticService {

    constructor(messages: MessagesService) {super(messages)}

    listAllIndices(callback) {
        this.client.cat.indices({
            format: "json",
            v: true
        }, (err, res) => {
            if (err) {
                this.messages.error(err);
            } else {
                callback(res);
            }
        });
    }

    getMapping4Index(index: string, type: string, callback) {
        this.client.indices.getMapping({
            index: index,
            //type: type,
        }, (err, res) => {
            if (err) {
                this.messages.error(err);
            } else {
                callback(res);
            }
        });
    }

    getSettings4Index(index: string, callback) {
        this.client.indices.getSettings({
            index: index
        }, (err, res) => {
            if (err) {
                this.messages.error(err);
            } else {
                callback(res);
            }
        });
    }
} 