import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type BlockStylesProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};

import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from "../../../constants/device-sizes";
import { TARGET } from "../../../constants/target";
import type { BuilderContextInterface } from "../../../context/types";
import { camelToKebabCase } from "../../../functions/camel-to-kebab-case";
import { getProcessedBlock } from "../../../functions/get-processed-block";
import { createCssClass } from "../../../helpers/css";
import { checkIsDefined } from "../../../helpers/nullable";
import type { BuilderBlock } from "../../../types/builder-block";
import InlinedStyles from "../../inlined-styles";

@Component({
  selector: "block-styles, BlockStyles",
  template: `
    <ng-container *ngIf="TARGET !== 'reactNative' && css && canShowBlock">
      <inlined-styles
        id="builderio-block"
        [styles]="css"
        [nonce]="context.nonce"
      ></inlined-styles>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, InlinedStyles],
})
export default class BlockStyles {
  TARGET = TARGET;

  @Input() block!: BlockStylesProps["block"];
  @Input() context!: BlockStylesProps["context"];

  get canShowBlock() {
    const processedBlock = getProcessedBlock({
      block: this.block,
      localState: this.context.localState,
      rootState: this.context.rootState,
      rootSetState: this.context.rootSetState,
      context: this.context.context,
      shouldEvaluateBindings: true,
    });
    // only render styles for blocks that are visible
    if (checkIsDefined(processedBlock.hide)) {
      return !processedBlock.hide;
    }
    if (checkIsDefined(processedBlock.show)) {
      return processedBlock.show;
    }
    return true;
  }
  get css() {
    const processedBlock = getProcessedBlock({
      block: this.block,
      localState: this.context.localState,
      rootState: this.context.rootState,
      rootSetState: this.context.rootSetState,
      context: this.context.context,
      shouldEvaluateBindings: true,
    });
    const styles = processedBlock.responsiveStyles;
    const content = this.context.content;
    const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(
      content?.meta?.breakpoints || {}
    );
    const largeStyles = styles?.large;
    const mediumStyles = styles?.medium;
    const smallStyles = styles?.small;
    const className = processedBlock.id;
    if (!className) {
      return "";
    }
    const largeStylesClass = largeStyles
      ? createCssClass({
          className,
          styles: largeStyles,
        })
      : "";
    const mediumStylesClass = mediumStyles
      ? createCssClass({
          className,
          styles: mediumStyles,
          mediaQuery: getMaxWidthQueryForSize(
            "medium",
            sizesWithUpdatedBreakpoints
          ),
        })
      : "";
    const smallStylesClass = smallStyles
      ? createCssClass({
          className,
          styles: smallStyles,
          mediaQuery: getMaxWidthQueryForSize(
            "small",
            sizesWithUpdatedBreakpoints
          ),
        })
      : "";
    const hoverAnimation =
      processedBlock.animations &&
      processedBlock.animations.find((item) => item.trigger === "hover");
    let hoverStylesClass = "";
    if (hoverAnimation) {
      const hoverStyles = hoverAnimation.steps?.[1]?.styles || {};
      hoverStylesClass =
        createCssClass({
          className: `${className}:hover`,
          styles: {
            ...hoverStyles,
            transition: `all ${hoverAnimation.duration}s ${camelToKebabCase(
              hoverAnimation.easing
            )}`,
            transitionDelay: hoverAnimation.delay
              ? `${hoverAnimation.delay}s`
              : "0s",
          },
        }) || "";
    }
    return [
      largeStylesClass,
      mediumStylesClass,
      smallStylesClass,
      hoverStylesClass,
    ].join(" ");
  }
}
