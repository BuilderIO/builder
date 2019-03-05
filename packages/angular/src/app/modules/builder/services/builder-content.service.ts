import { Injectable } from '@angular/core';
import { BuilderContentComponent } from '../components/builder-content/builder-content.component';
import { BuilderContentDirective } from '../directives/builder-content.directive';

@Injectable()
export class BuilderContentService {
  componentInstance: BuilderContentComponent | null = null;
  directiveInstance: BuilderContentDirective | null = null;
}
