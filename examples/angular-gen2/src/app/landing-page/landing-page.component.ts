import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-angular';
import { Content } from '@builder.io/sdk-angular';


@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [Content, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  // Add your Public API Key, specify the page model, and initialize the content variable
  apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
  model = 'page';
  content: BuilderContent | null = null;

  async ngOnInit() {
    const urlPath = window.location.pathname || '';
    // fetch the content for the current page based on the current URL 
    const content = await fetchOneEntry({
      apiKey: this.apiKey,
      model: this.model,
      userAttributes: {
        urlPath,
      },
    });

    if (!content) {
      return;
    }

    this.content = content;
  }
}