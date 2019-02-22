import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { BuilderComponent } from '../../../builder/decorators/builder-component.dectorator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'builder-rich-text',
  templateUrl: './builder-rich-text.component.html',
  styleUrls: ['./builder-rich-text.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@BuilderComponent({
  name: 'Text',
  image:
    // tslint:disable-ntext
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-text_fields-24px%20(1).svg?alt=media&token=12177b73-0ee3-42ca-98c6-0dd003de1929',
  inputs: [
    {
      name: 'content',
      type: 'html',
      defaultValue: `
        <h1>Hello there</h1>
        <p>You can enter any text in here!</p>
      `,
    },
  ],
})
export class BuilderRichTextComponent implements OnInit {
  @Input() content: string | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  get html(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.content || '');
  }

  ngOnInit() {}
}
