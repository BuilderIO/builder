import { Injectable } from '@angular/core';
import { BuilderContentComponent } from '../builder-content/builder-content.component';

@Injectable()
export class BuilderComponentService {
  contentComponentInstance: BuilderContentComponent | null = null;
}
