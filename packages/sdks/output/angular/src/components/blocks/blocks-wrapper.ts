import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
  /**
   * The element that wraps each list of blocks. Defaults to a `div` element ('ScrollView' in React Native).
   */
  BlocksWrapper: any;
  /**
   * Additonal props to pass to `blocksWrapper`. Defaults to `{}`.
   */
  BlocksWrapperProps: any;
  children?: any;
};

import diff from 'microdiff';
import { isEditing } from '../../functions/is-editing';
import type { BuilderBlock } from '../../types/builder-block';

@Component({
  selector: 'blocks-wrapper, BlocksWrapper',
  template: `
    <ng-template #blockswrapperTemplate><ng-content></ng-content></ng-template>
    <ng-container
      *ngComponentOutlet="
        BlocksWrapper;
        inputs: mergedInputs_yllqi6;
        content: myContent
      "
    ></ng-container>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .props-blocks-wrapper {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export default class BlocksWrapper {
  @Input() blocks!: BlocksWrapperProps['blocks'];
  @Input() parent!: BlocksWrapperProps['parent'];
  @Input() path!: BlocksWrapperProps['path'];
  @Input() styleProp!: BlocksWrapperProps['styleProp'];
  @Input() BlocksWrapperProps!: BlocksWrapperProps['BlocksWrapperProps'];
  @Input() BlocksWrapper!: BlocksWrapperProps['BlocksWrapper'];

  @ViewChild('blockswrapperTemplate', { static: true })
  blockswrapperTemplateRef!: TemplateRef<any>;

  myContent?: any[][];

  get className() {
    return 'builder-blocks' + (!this.blocks?.length ? ' no-blocks' : '');
  }
  onClick() {
    if (isEditing() && !this.blocks?.length) {
      window.parent?.postMessage(
        {
          type: 'builder.clickEmptyBlocks',
          data: {
            parentElementId: this.parent,
            dataPath: this.path,
          },
        },
        '*'
      );
    }
  }
  onMouseEnter() {
    if (isEditing() && !this.blocks?.length) {
      window.parent?.postMessage(
        {
          type: 'builder.hoverEmptyBlocks',
          data: {
            parentElementId: this.parent,
            dataPath: this.path,
          },
        },
        '*'
      );
    }
  }
  mergedInputs_yllqi6 = {} as any;

  constructor(private vcRef: ViewContainerRef) {}

  ngAfterContentInit() {
    this.mergedInputs_yllqi6 = {
      class: this.className + ' props-blocks-wrapper',
      'builder-path': this.path,
      'builder-parent-id': this.parent,
      style: this.styleProp,
      onClick: this.onClick.bind(this),
      onMouseEnter: this.onMouseEnter.bind(this),
      onKeyPress: this.onClick.bind(this),
      ...this.BlocksWrapperProps,
    };

    this.myContent = [
      this.vcRef.createEmbeddedView(this.blockswrapperTemplateRef).rootNodes,
    ];
  }

  ngOnChanges(changes: SimpleChanges) {
    const blocksLengthChanged =
      changes.blocks?.previousValue?.length !==
      changes.blocks?.currentValue?.length;
    const parentChanged =
      changes.parent?.previousValue !== changes.parent?.currentValue;
    const pathChanged =
      changes.path?.previousValue !== changes.path?.currentValue;
    const handlerChanges = blocksLengthChanged || parentChanged || pathChanged;

    if (handlerChanges) {
      console.log('blocks-wrapper: ngOnChanges (handlerChanges)', changes);
      this.mergedInputs_yllqi6.onClick = this.onClick.bind(this);
      this.mergedInputs_yllqi6.onMouseEnter = this.onMouseEnter.bind(this);
      this.mergedInputs_yllqi6.onKeyPress = this.onClick.bind(this);
    }

    if (blocksLengthChanged) {
      console.log('blocks-wrapper: ngOnChanges (blocksLengthChanged)', changes);
      this.mergedInputs_yllqi6.class = this.className + ' props-blocks-wrapper';
    }

    if (parentChanged) {
      console.log('blocks-wrapper: ngOnChanges (parentChanged)', changes);
      this.mergedInputs_yllqi6['builder-parent-id'] = this.parent;
    }

    if (pathChanged) {
      console.log('blocks-wrapper: ngOnChanges (pathChanged)', changes);
      this.mergedInputs_yllqi6['builder-path'] = this.path;
    }

    if (changes.styleProp) {
      console.log('blocks-wrapper: ngOnChanges (changes.styleProp)', changes);
      this.mergedInputs_yllqi6.style = this.styleProp;
    }

    if (changes.BlocksWrapperProps) {
      console.log(
        'blocks-wrapper: ngOnChanges (changes.BlocksWrapperProps)',
        changes
      );
      this.mergedInputs_yllqi6 = {
        ...this.mergedInputs_yllqi6,
        ...this.BlocksWrapperProps,
      };
    }
  }
}
