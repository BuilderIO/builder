import { Component, OnInit } from '@angular/core';
import * as logo from '../../assets/logo.png';

@Component({
  selector: 'shopstyle-header',
  templateUrl: './shopstyle-header.component.html',
  styleUrls: ['./shopstyle-header.component.css'],
})
export class ShopstyleHeaderComponent implements OnInit {
  logo = logo;

  constructor() {}

  ngOnInit() {}
}
