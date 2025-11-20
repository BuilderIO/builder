import { ChangeDetectorRef, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Content, type BuilderContent } from '@builder.io/sdk-angular';
import { skip } from 'rxjs';

@Component({
  selector: 'app-catch-all-page',
  standalone: true,
  imports: [Content, RouterLink],
  template: `
    @if (builderContent(); as builderContent) {
      <a routerLink="/">Home</a>
      |
      <a routerLink="/en/builder-repeat">Page1</a>
      |
      <a routerLink="/en/builder-repeat-2">Page2</a>
      <builder-content
        model="page"
        [content]="builderContent"
        apiKey="bc692bc2e70e4774b3065ec0248cb7a9"
      />
    }
  `,
})
export class CatchAllPage {
  #cdRef = inject(ChangeDetectorRef);
  #route = inject(ActivatedRoute);
  #routeData = toSignal(this.#route.data);

  builderContent = computed(() => {
    const content = this.#routeData()?.['content'];
    if (!content || content instanceof Error) {
      return null;
    }
    console.log('college results length', content?.data?.state?.college?.results?.length);
    return content as BuilderContent;
  });

  constructor() {
    // If this isn't here you get an ExpressionChangedAfterItHasBeenCheckedError
    toObservable(this.builderContent)
      .pipe(skip(1))
      .subscribe(() => {
        this.#cdRef.markForCheck();
      });
  }
}
