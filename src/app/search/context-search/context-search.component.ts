import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { FcrepoService } from '../services/fcrepo.service';

@Component({
  selector: 'app-context-search',
  templateUrl: './context-search.component.html',
  styleUrls: ['./context-search.component.scss']
})
export class ContextSearchComponent implements OnInit {

  resource;
  r2display;

  constructor(private fcrepo: FcrepoService) {}

  ngOnInit() {
    /*
    this.resource = this.fcrepo.getResource("collections/ffm")
    .subscribe(data => this.resource = data);
    //this.r2display = JSON.parse(JSON.stringify(this.resource[0]));
    this.r2display = this.resource[0];
    console.log("1 "+this.resource);
    console.log("2 "+JSON.stringify(this.resource[0]));
    */
  }
  
}
