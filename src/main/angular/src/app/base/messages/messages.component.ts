import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'messages-component',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent implements OnInit {
  message;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private dialog: MatDialogRef<MessagesComponent>,
  ) {}

  ngOnInit() {
    this.message = this.data;
  }

  close() {
    this.dialog.close();
  }
}
