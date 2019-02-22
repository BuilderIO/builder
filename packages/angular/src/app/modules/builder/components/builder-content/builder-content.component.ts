import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Builder } from '@builder.io/sdk';
import { BuilderContentService } from '../../services/builder-content.service';
import { BuilderService } from '../../services/builder.service';

@Component({
  selector: 'builder-content',
  templateUrl: './builder-content.component.html',
  styleUrls: ['./builder-content.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderContentComponent implements OnInit, OnDestroy {
  constructor(private element: ElementRef, builderContentService: BuilderContentService) {
    builderContentService.componentInstance = this;
  }

  modelName?: string;

  @Input() useHtml = false;

  @Output() contentLoad = new EventEmitter<any>();
  @Output() contentError = new EventEmitter<any>();

  get editingMode() {
    return Builder.editingPage;
  }

  ngOnInit() {
    const modelName =
      this.element.nativeElement &&
      (this.element.nativeElement as HTMLElement).getAttribute &&
      (this.element.nativeElement as HTMLElement).getAttribute('builder-model');
    if (modelName) {
      // FIXME: doesn't work on server!
      this.modelName = modelName;
      BuilderService.componentInstances[modelName] = this;
    }
  }

  ngOnDestroy() {
    if (this.modelName) {
      if (BuilderService.componentInstances[this.modelName] === this) {
        delete BuilderService.componentInstances[this.modelName];
      }
    }
  }
}
