import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup} from '@angular/forms';

export const actionTypes = ['add', 'remove'];

@Component({
  selector: 'index-alias-component',
  templateUrl: './index-alias.component.html',
  styleUrls: ['./index-alias.component.scss'],
})
export class IndexAliasComponent implements OnInit {
  @Input()
    indexAliasForm: FormGroup;
  @Input()
    indexList: any[];

  @Output()
    notice = new EventEmitter<string>();

  filteredIndices: string[] = [];
  actions: string[] = actionTypes;

  constructor(
  ) {}

  ngOnInit() {}

  filter() {
    const selectedIndex = this.indexAliasForm.get('index') as FormGroup;
    if (selectedIndex.value !== '') {
      this.filteredIndices = this.indexList.filter((el) => {
        return el.toLowerCase().indexOf(selectedIndex.value.toLowerCase()) > -1;
      });
    } else {
      this.filteredIndices = [];
    }
  }

  select(index: any) {
    this.indexAliasForm.patchValue({index: index});
    this.filteredIndices = [];
  }

  onActionSelect(selected: any) {
    this.indexAliasForm.patchValue({action: selected});
  }

  onIndexSelect(selected: any) {
    this.indexAliasForm.patchValue({index: selected});
  }

  onAliasSelect(selected: any) {
    this.indexAliasForm.patchValue({alias: selected});
  }

  close() {
    this.indexAliasForm.patchValue({index: ''});
    this.filteredIndices = [];
  }

  addAliasForm() {
    this.notice.emit('add');
  }

  removeAliasForm() {
    this.notice.emit('remove');
  }
}
