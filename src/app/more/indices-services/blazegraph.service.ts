
import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpParams } from '@angular/common/http';




import { props } from '../../base/common/admintool.properties';
import { MessagesService } from '../../base/services/messages.service';

@Injectable()
export class BlazegraphService {

    constructor(private http: HttpClient,
        private messages: MessagesService) {}

    getNamedGraphs(): Observable<any[]> {
        const blazegraphURI: string = props.blazegraph_sparql_url;
        const results: any[] = [];
        const headers = new HttpHeaders().set('Content-Type', 'application/rdf+xml');
        const params = new HttpParams().set('query', 'select $g {graph $g{}}')
            .set('format', 'json');
        return this.http.request('GET', blazegraphURI, {
            headers: headers,
            params: params
        }).pipe(
            map((response: any) => {
                response.results.bindings.forEach(resource => {
                    results.push(resource);
                });
                return results;
            })
        );
    }

    describeResource(resourceIRI, graphIRI): Observable<any[]> {
        // const blazegraphURI: string = 'http://b253.demo/blazegraph/namespace/inge/sparql';
        const blazegraphURI: string = props.blazegraph_sparql_url;
        const results: any[] = [];
        const headers = new HttpHeaders().set('Content-Type', 'application/rdf+xml');
        const params = new HttpParams()
            .set('query',
             'CONSTRUCT { <' + resourceIRI + '> ?p ?o . ?o ?op ?oo } { <' + resourceIRI + '> ?p ?o OPTIONAL { ?o ?op ?oo . FILTER ( isBlank(?o) ) } }')
            .set('format', 'json');
        // params.set('query', 'describe <' + resourceIRI + '> $o {<' + resourceIRI + '> $p $o}');
        // params.set('query', 'select * {graph <' + graphIRI +'>{<' + resourceIRI + '> $p $o . filter (!isBlank(?o))}}');
        return this.http.request('POST', blazegraphURI, {
            headers: headers,
            params: params
        }).pipe(
            map((response: any) => {
                response.results.bindings.forEach(resource => {
                    results.push(resource);
                });
                return results;
            })
        );
    }

    insertResourceFromURI(uri: string, graphIRI) {

        // const blazegraphURI: string = 'http://b253.demo/blazegraph/namespace/inge/sparql';
        const blazegraphURI: string = props.blazegraph_sparql_url;
        const headers = new HttpHeaders().set('Content-Type', 'application/rdf+xml');
        const params = new HttpParams().set('context-uri', graphIRI).set('uri', uri);
        return this.http.request('POST', blazegraphURI, {
            headers: headers,
            params: params
        }).pipe(
            map((response: any) => {
                return response.text();
            }),
            catchError((error) => {
                this.messages.error(error);
                return observableThrowError(error.text() || ' error');
            })
        );
    }
}
