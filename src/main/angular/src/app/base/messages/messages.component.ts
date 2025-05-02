import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
    selector: 'messages-component',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss'],
    standalone: true,
    imports: [CommonModule, MatDialogModule]
})
export class MessagesComponent implements OnInit {
  message: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private dialog: MatDialogRef<MessagesComponent>,
  ) {}


  ngOnInit() {
    this.message = this.data;
  }
}
