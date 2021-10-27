import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MessagesComponent} from '../messages/messages.component';
import {Overlay} from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  messageDialogRef: MatDialogRef<MessagesComponent>;
  // messageDialogConfig = new MatDialogConfig();

  constructor(
    private dialog: MatDialog,
    private overlay: Overlay
  ) {}

  displayMessage(message?) {
    this.messageDialogRef = this.dialog.open(MessagesComponent, {
      data: message,
      panelClass: 'isis-mat-dialog',
    });
  }

  info(message: string) {
    const msg = {text: message};
    this.displayMessage(msg);
  }

  success(message: string) {
    const msg = {type: 'success', text: message};
    this.displayMessage(msg);
  }

  warning(message: string) {
    const msg = {type: 'warning', text: message};
    this.displayMessage(msg);
  }

  error(message: string) {
    const msg = {type: 'error', text: message};
    this.displayMessage(msg);
  }
}
