// overriden as we need to add a reference to the video element to set the attributes
import { CommonModule } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';

import type { VideoProps } from './video.types';

@Component({
  selector: 'builder-video, BuilderVideo',
  template: `
    <div [ngStyle]="node_0_div">
      <video
        #v
        class="builder-video"
        [attr.state.spreadProps]="spreadProps"
        [attr.preload]="preload || 'metadata'"
        [ngStyle]="node_1_video"
        [attr.src]="video || 'no-src'"
        [attr.poster]="posterImage"
      >
        <ng-container *ngIf="!lazyLoad">
          <source type="video/mp4" [attr.src]="video" />
        </ng-container>
      </video>
      <ng-container *ngIf="node_2_Show">
        <div [ngStyle]="node_3_div"></div>
      </ng-container>
      <ng-container *ngIf="builderBlock?.children?.length && fitContent">
        <div [ngStyle]="node_4_div"><ng-content></ng-content></div>
      </ng-container>
      <ng-container *ngIf="builderBlock?.children?.length && !fitContent">
        <div [ngStyle]="node_5_div"><ng-content></ng-content></div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export default class BuilderVideo {
  @Input() attributes!: VideoProps['attributes'];
  @Input() fit!: VideoProps['fit'];
  @Input() position!: VideoProps['position'];
  @Input() aspectRatio!: VideoProps['aspectRatio'];
  @Input() fitContent!: VideoProps['fitContent'];
  @Input() builderBlock!: VideoProps['builderBlock'];
  @Input() autoPlay!: VideoProps['autoPlay'];
  @Input() muted!: VideoProps['muted'];
  @Input() controls!: VideoProps['controls'];
  @Input() loop!: VideoProps['loop'];
  @Input() playsInline!: VideoProps['playsInline'];
  @Input() preload!: VideoProps['preload'];
  @Input() video!: VideoProps['video'];
  @Input() posterImage!: VideoProps['posterImage'];
  @Input() lazyLoad!: VideoProps['lazyLoad'];

  @ViewChild('v', { read: ElementRef })
  v!: ElementRef;

  get videoProps() {
    return {
      ...(this.autoPlay === true
        ? {
            autoPlay: true,
          }
        : {}),
      ...(this.muted === true
        ? {
            muted: true,
          }
        : {}),
      ...(this.controls === true
        ? {
            controls: true,
          }
        : {}),
      ...(this.loop === true
        ? {
            loop: true,
          }
        : {}),
      ...(this.playsInline === true
        ? {
            playsInline: true,
          }
        : {}),
    };
  }
  get spreadProps() {
    return {
      ...this.videoProps,
    };
  }
  node_0_div: any = null;
  node_1_video: any = null;
  node_2_Show: any = null;
  node_3_div: any = null;
  node_4_div: any = null;
  node_5_div: any = null;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const onMountHook_0 = () => {
      this.node_0_div = {
        position: 'relative',
      };
    };
    onMountHook_0();
    const onMountHook_1 = () => {
      this.node_1_video = {
        width: '100%',
        height: '100%',
        ...this.attributes?.style,
        objectFit: this.fit,
        objectPosition: this.position,
        // Hack to get object fit to work as expected and
        // not have the video overflow
        zIndex: 2,
        borderRadius: '1px',
        ...(this.aspectRatio
          ? {
              position: 'absolute',
            }
          : null),
      };
    };
    onMountHook_1();
    const onMountHook_2 = () => {
      this.node_2_Show =
        this.aspectRatio &&
        !(this.fitContent && this.builderBlock?.children?.length);
    };
    onMountHook_2();
    const onMountHook_3 = () => {
      this.node_3_div = {
        width: '100%',
        paddingTop: this.aspectRatio! * 100 + '%',
        pointerEvents: 'none',
        fontSize: '0px',
      };
    };
    onMountHook_3();
    const onMountHook_4 = () => {
      this.node_4_div = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      };
    };
    onMountHook_4();
    const onMountHook_5 = () => {
      this.node_5_div = {
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
      };
    };
    onMountHook_5();
    const el = this.v && this.v.nativeElement;
    if (el && this.videoProps) {
      Object.keys(this.videoProps).forEach((key) => {
        this.renderer.setAttribute(el, key, this.videoProps[key] ?? '');
      });
    }
  }

  ngOnChanges() {
    this.node_0_div = {
      position: 'relative',
    };
    this.node_1_video = {
      width: '100%',
      height: '100%',
      ...this.attributes?.style,
      objectFit: this.fit,
      objectPosition: this.position,
      // Hack to get object fit to work as expected and
      // not have the video overflow
      zIndex: 2,
      borderRadius: '1px',
      ...(this.aspectRatio
        ? {
            position: 'absolute',
          }
        : null),
    };
    this.node_2_Show =
      this.aspectRatio &&
      !(this.fitContent && this.builderBlock?.children?.length);
    this.node_3_div = {
      width: '100%',
      paddingTop: this.aspectRatio! * 100 + '%',
      pointerEvents: 'none',
      fontSize: '0px',
    };
    this.node_4_div = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    };
    this.node_5_div = {
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
    };
    const el = this.v && this.v.nativeElement;
    const propsNow = {
      ...(this.autoPlay === true
        ? {
            autoPlay: true,
          }
        : {}),
      ...(this.muted === true
        ? {
            muted: true,
          }
        : {}),
      ...(this.controls === true
        ? {
            controls: true,
          }
        : {}),
      ...(this.loop === true
        ? {
            loop: true,
          }
        : {}),
      ...(this.playsInline === true
        ? {
            playsInline: true,
          }
        : {}),
    };
    if (el && propsNow) {
      Object.keys(propsNow).forEach((key) => {
        this.renderer.setAttribute(el, key, this.videoProps[key] ?? '');
      });
    }
  }
}
