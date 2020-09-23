import { Component, Input, OnInit } from '@angular/core';
import { random } from 'lodash';

@Component({
  selector: 'name-avatar',
  templateUrl: './name-avatar.component.html',
  styleUrls: ['./name-avatar.component.scss']
})
export class NameAvatarComponent implements OnInit {
  @Input() nameString: string;
  colors: string[] = [
    '#e57373',
    '#f06292',
    '#ba68c8',
    '#9575cd',
    '#7986cb',
    '#64b5f6',
    '#4fc3f7',
    '#4dd0e1',
    '#4db6ac',
    '#81c784',
    '#aed581',
    '#ff8a65',
    '#d4e157',
    '#673ab7',
    '#ffb74d',
    '#a1887f',
    '#90a4ae'
  ];
  backgroundColors: string[] = [
    'rgba(229, 115, 115, 0.4)',
    'rgba(240, 98, 146, 0.4)',
    'rgba(186, 104, 200, 0.4)',
    'rgba(149, 117, 205, 0.4)',
    'rgba(121, 134, 203, 0.4)',
    'rgba(100, 181, 246, 0.4)',
    'rgba(79, 195, 247, 0.4)',
    'rgba(77, 208, 225, 0.4)',
    'rgba(77, 182, 172, 0.4)',
    'rgba(129, 199, 132, 0.4)',
    'rgba(174, 213, 129, 0.4)',
    'rgba(255, 138, 101, 0.4)',
    'rgba(212, 225, 87, 0.4)',
    'rgba(103, 58, 183, 0.4)',
    'rgba(255, 183, 77, 0.4)',
    'rgba(161, 136, 127, 0.4)',
    'rgba(144, 164, 174, 0.4)'
  ];
  avatarText: string;
  color: string;
  backgroundColor: string;
  constructor() {}

  ngOnInit() {
    this.getColor(this.nameString);
    this.avatarText = this.nameString;
    if (this.avatarText.constructor === String) {
      let content = this.nameString.split(' ', 2);
      this.avatarText = content.reduce(
        (prevValue, word) => (prevValue += word.charAt(0).toUpperCase()),
        ''
      );
    }
  }

  getColor(name: string): void {
    let index = 0;
    index = Math.abs(random(0, 1000)) % this.backgroundColors.length;
    this.color = this.colors[index];
    this.backgroundColor = this.backgroundColors[index];
  }
}
