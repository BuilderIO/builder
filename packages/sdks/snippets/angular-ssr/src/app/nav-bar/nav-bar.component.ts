import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuilderContent } from '@builder.io/sdk-angular';
import { NavLinksComponent } from './nav-links/nav-links.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, NavLinksComponent],
  template: `
    <nav>
      <app-nav-links [links]="links" />
    </nav>
    <!-- <RestOfYourPage /> -->
  `,
})
export class NavBarComponent implements OnInit {
  links: BuilderContent[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.links = data.navLinks;
    });
  }
}
