import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import * as bodyBuilder from 'bodybuilder';
import {ConnectionService} from '../../services/connection.service';
import {PubmanRestService} from '../../services/pubman-rest.service';

@Injectable()
export class SearchService extends PubmanRestService {
  constructor(
    protected connectionService: ConnectionService,
    protected httpClient: HttpClient,
  ) {
    super(connectionService, httpClient);
  }

  buildQuery(request, limit, offset, sortfield, ascdesc) {
    let query = bodyBuilder();

    request.searchTerms.forEach((element) => {
      const field = element.field;
      const value: string = element.searchTerm;
      switch (element.type) {
      case 'must':
        query = query.query('match', field, value);
        break;
      case 'must_not':
        query = query.notFilter('term', field, value);
        break;
      case 'filter':
        query = query.filter('term', field, value);
        break;
      case 'should':
        query = query.orFilter('term', field, value);
        break;
      default:
      }
    });
    const body = query
      .size(limit)
      .from(offset)
      .sort(sortfield, ascdesc);
    return body.build();
  }

  convertSearchTerm(term: string): string {
    let convertedSearchTerm = '';
    if (term.startsWith('"') && term.endsWith('"')) {
      convertedSearchTerm = '"';
      for (let i = 1; i < term.length-1; i++) {
        const ch = term.substr(i, 1);
        convertedSearchTerm = this.handleSpecialCharacters(ch, convertedSearchTerm);
      }
      convertedSearchTerm = convertedSearchTerm + '"';
    } else {
      for (let i = 0; i < term.length; i++) {
        const ch = term.substr(i, 1);
        convertedSearchTerm = this.handleSpecialCharacters(ch, convertedSearchTerm);
      }
    }
    return convertedSearchTerm;
  }

  private handleSpecialCharacters(ch: string, convertedSearchTerm: string) {
    if (ch.match(/[A-Z0-9ÄÖÜ]/i)) {
      convertedSearchTerm = convertedSearchTerm + ch;
    } else if (!ch.match(/[#%&]/)) {
      convertedSearchTerm = convertedSearchTerm + '\\' + ch;
    }
    return convertedSearchTerm;
  }
}
