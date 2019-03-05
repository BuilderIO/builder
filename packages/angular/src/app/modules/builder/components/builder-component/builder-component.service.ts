import { Injectable } from '@angular/core';
import { BuilderContentComponent } from '../builder-content/builder-content.component';
import { BuilderContentDirective } from '../../directives/builder-content.directive';

@Injectable()
export class BuilderComponentService {
  contentComponentInstance: BuilderContentComponent | null = null;
  contentDirectiveInstance: BuilderContentDirective | null = null;
}
