import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MessagesComponent} from '../messages/messages.component';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {

  messageDialogRef: MatDialogRef<MessagesComponent>;

  constructor(
    private dialog: MatDialog,
  ) {}

  displayMessage(msg?: { text: any; type?: string; length?: any; substring?: any; }) {
    const maxMsgLength: number = 5000;
    if (msg.text.length > maxMsgLength) {
      msg.text = msg.text.substring(0, maxMsgLength - 1) + '...';
    }
    this.messageDialogRef = this.dialog.open(MessagesComponent, {
      data: msg
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
