import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class BlazegraphService {

    constructor(private http: HttpClient,
        private messages: MessagesService) {}

    getNamedGraphs(): Observable<any[]> {
        let blazegraphURI: string = props.blazegraph_sparql_url;
        let results: any[] = [];
        let headers = new HttpHeaders().set('Content-Type', 'application/rdf+xml');
        let params = new HttpParams().set('query', 'select $g {graph $g{}}')
            .set('format', 'json');
        return this.http.request('GET', blazegraphURI, {
            headers:headers,
            params:params
        })
            .map((response : any) => {
                response.results.bindings.forEach(resource => {
                    results.push(resource);
                });
                return results;
            });
    } 

    describeResource(resourceIRI, graphIRI): Observable<any[]> {
        //let blazegraphURI: string = "http://b253.demo/blazegraph/namespace/inge/sparql";
        let blazegraphURI: string = props.blazegraph_sparql_url;
        let results: any[] = [];
        let headers = new HttpHeaders().set('Content-Type', 'application/rdf+xml');
        let params = new HttpParams().set('query', 'CONSTRUCT { <' + resourceIRI + '> ?p ?o . ?o ?op ?oo } { <' + resourceIRI + '> ?p ?o OPTIONAL { ?o ?op ?oo . FILTER ( isBlank(?o) ) } }')
            .set('format', 'json');
        //params.set('query', 'describe <' + resourceIRI + '> $o {<' + resourceIRI + '> $p $o}');
        // params.set('query', 'select * {graph <' + graphIRI +'>{<' + resourceIRI + '> $p $o . filter (!isBlank(?o))}}');
        return this.http.request('POST', blazegraphURI, {
            headers:headers,
            params:params
        })
            .map((response: any) => {
                response.results.bindings.forEach(resource => {
                    results.push(resource);
                });
                return results;
            });
    }

    insertResourceFromURI(uri: string, graphIRI) {

        // let blazegraphURI: string = "http://b253.demo/blazegraph/namespace/inge/sparql";
        let blazegraphURI: string = props.blazegraph_sparql_url;
        let headers = new HttpHeaders().set('Content-Type', 'application/rdf+xml');
        let params = new HttpParams().set('context-uri', graphIRI).set('uri', uri);
        return this.http.request('POST', blazegraphURI, {
            headers:headers,
            params:params
        })
            .map((response: any) => {
                return response.text();
            })
            .catch(error => {
                this.messages.error(error);
                return Observable.throw(error.text() || ' error'); 
            });
    }

}