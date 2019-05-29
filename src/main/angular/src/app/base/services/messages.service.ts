import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { MessagesComponent } from '../messages/messages.component';
import { Overlay } from '@angular/cdk/overlay';
@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  messageDialogRef: MatDialogRef<MessagesComponent>;
  // messageDialogConfig = new MatDialogConfig();

  constructor(private dialog: MatDialog, private overlay: Overlay) { }

  displayMessage(message?) {
    this.messageDialogRef = this.dialog.open(MessagesComponent, {
      hasBackdrop: false,
      //width: '100%',
      //role: 'alertdialog',
      //autoFocus: false,
      //scrollStrategy: this.overlay.scrollStrategies.noop(),
      data: message,
      panelClass: 'isis-mat-dialog'
    });
  }

  info(message: string) {
    const msg = { text: message };
    this.displayMessage(msg);
  }

  success(message: string) {
    const msg = { type: 'success', text: message };
    this.displayMessage(msg);
  }

  warning(message: string) {
    const msg = { type: 'warning', text: message };
    this.displayMessage(msg);
  }

  error(message: string) {
    const msg = { type: 'error', text: message };
    this.displayMessage(msg);
  }
}
