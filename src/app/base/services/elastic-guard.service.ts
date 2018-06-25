import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ElasticGuard implements CanActivate {

  constructor() { }

  canActivate(): boolean {
    return this.getThePermission();
  }

  getThePermission(): boolean {
    const phrase = prompt('not even roland is allowd 2 do that!');
    if (phrase === environment.elastic_admin) {
      return true;
    } else {
      return false;
    }
  }
}
