import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BuilderComponent } from '../../../builder/decorators/builder-component.dectorator';

@Component({
  selector: 'builder-embed',
  templateUrl: './builder-embed.component.html',
  styleUrls: ['./builder-embed.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// TODO: custom editor for this.....
// web component??? or iframe (how trello, contentful do it)
@BuilderComponent({
  name: 'Embed',
  inputs: [
    {
      // TODO: custom friendly name?
      name: 'contentUrl',
      type: 'url',
      required: true,
      // Editor:
    },
    {
      name: 'height',
      type: 'number',
      // default: 400,
    },
    {
      name: 'width',
      type: 'number',
    },
  ],
})
export class BuilderEmbedComponent implements OnInit {
  constructor(private sanitizer: DomSanitizer) {}

  @Input() contentUrl?: string;
  @Input() embedUrl?: string;
  @Input() width?: number;
  @Input() height?: number;

  get url(): string {
    return (
      this.contentUrl &&
      (this.sanitizer.bypassSecurityTrustResourceUrl(this.embedUrl || this.contentUrl) as any)
    );
  }

  ngOnInit() {}
}
