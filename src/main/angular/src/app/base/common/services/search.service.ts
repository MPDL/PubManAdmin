import {Injectable} from '@angular/core';
import {Ou} from '../model/inge';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(
  ) {
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

  getListOfOusForLocalAdminFromOus(ous: Ou[], searchField: string): string {
    let lst: string = '';
    ous.forEach((ou: Ou) => {
      if (lst.length > 0) {
        lst = lst + '+';
      }
      lst = lst + searchField + ':' + ou.objectId;
    });

    return lst;
  }

  getListOfIds(ids: string[], searchField: string): string {
    let lst: string = '';
    ids.forEach((id: string) => {
      if (lst.length > 0) {
        lst = lst + '+';
      }
      lst = lst + searchField + ':' + id;
    });

    return lst;
  }
}
