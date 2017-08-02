import { Injectable } from '@angular/core';
import { Http, Jsonp, Headers, Request, Response, RequestOptions, RequestMethod, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class BlazegraphService {

    constructor(private http: Http,
        private messages: MessagesService) {}

    getNamedGraphs(): Observable<any[]> {
        let blazegraphURI: string = props.blazegraph_sparql_url;
        let results: any[] = [];
        let headers = new Headers();
        let params = new URLSearchParams();
        params.set('query', 'select $g {graph $g{}}');
        params.set('format', 'json');
        headers.set('Content-Type', 'application/rdf+xml');
        let options = new RequestOptions({
            method: RequestMethod.Post,
            headers: headers,
            url: blazegraphURI,
            params: params
        });
        return this.http.request(new Request(options))
            .map((response) => {
                response.json().results.bindings.forEach(resource => {
                    results.push(resource);
                });
                return results;
            });
    } 

    describeResource(resourceIRI, graphIRI): Observable<any[]> {
        //let blazegraphURI: string = "http://b253.demo/blazegraph/namespace/inge/sparql";
        let blazegraphURI: string = props.blazegraph_sparql_url;
        let results: any[] = [];
        let headers = new Headers();
        let params = new URLSearchParams();
        //params.set('query', 'describe <' + resourceIRI + '> $o {<' + resourceIRI + '> $p $o}');
        params.set('query', 'CONSTRUCT { <' + resourceIRI + '> ?p ?o . ?o ?op ?oo } { <' + resourceIRI + '> ?p ?o OPTIONAL { ?o ?op ?oo . FILTER ( isBlank(?o) ) } }')
        // params.set('query', 'select * {graph <' + graphIRI +'>{<' + resourceIRI + '> $p $o . filter (!isBlank(?o))}}');
        params.set('format', 'json');
        headers.set('Content-Type', 'application/rdf+xml');
        let options = new RequestOptions({
            method: RequestMethod.Post,
            headers: headers,
            url: blazegraphURI,
            params: params
        });
        return this.http.request(new Request(options))
            .map((response) => {
                response.json().results.bindings.forEach(resource => {
                    results.push(resource);
                });
                return results;
            });
    }

    insertResourceFromURI(uri: string, graphIRI) {

        // let blazegraphURI: string = "http://b253.demo/blazegraph/namespace/inge/sparql";
        let blazegraphURI: string = props.blazegraph_sparql_url;
        let headers = new Headers();
        let params = new URLSearchParams();
        params.set('context-uri', graphIRI);
        params.set('uri', uri);
        headers.set('Content-Type', 'application/rdf+xml');
        // headers.set('Content-Type', 'application/ld+json');
        let options = new RequestOptions({
            method: RequestMethod.Post,
            headers: headers,
            url: blazegraphURI,
            params: params
        });
        return this.http.request(new Request(options))
            .map(response => {
                return response.text();
            })
            .catch(error => {
                this.messages.error(error);
                return Observable.throw(error.text() || ' error'); 
            });
    }


}