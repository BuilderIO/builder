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
    <nav
      style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;"
    >
      <div class="brand-name">
        <h1>Acme company</h1>
      </div>

      <app-nav-links [links]="links" *ngIf="links" />

      <div style="display: flex; gap: 10px;">
        <button>Login</button>
        <button>Register</button>
      </div>
    </nav>
  `,
})
export class NavBarComponent implements OnInit {
  links: BuilderContent = { data: { links: [] } };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.links = data.navLinks;
    });
  }
}
