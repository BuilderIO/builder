import { Component, OnInit } from '@angular/core';
import { ShopstyleHeadingComponent } from '../shopstyle-heading/shopstyle-heading.component';
import * as footerImage from '../../assets/footer.png';

@Component({
  selector: 'shopstyle-homepage',
  templateUrl: './shopstyle-homepage.component.html',
  styleUrls: ['./shopstyle-homepage.component.css'],
})
export class ShopstyleHomepageComponent implements OnInit {
  footerImage = footerImage;
  constructor() {}

  ngOnInit() {}
}
