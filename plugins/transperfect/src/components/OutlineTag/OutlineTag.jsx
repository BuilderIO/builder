/** @jsx jsx */
import { jsx, css } from "@emotion/react";

const OutlineTag = ({ className, content }) => {
    const tagStyles = css`
    display: inline-block;
    padding: 4px 0.5rem;
    font-size: 12px !important;
    font-weight: 600 !important;
    margin-right: 6px !important;
    height: fit-content;
    width: 100px;
    max-width: 100px;
    text-align: center;
    border: none !important;
    color: #ffffff;
    border-radius: 8px;
    
    &.preProcess {
      background-color: #3e627f;
    }
    
    &.delivered {
      background-color: rgb(139, 195, 74);
    }
    
    &.completed {
      background-color: rgb(103, 156, 51);
    }
    
    &.cancelled {
      background-color: #d72828;
    }
    
    &.default {
      background-color: #4a90e2;
    }
  `;

    return (
        <span css={tagStyles} className={className}>
            {content}
        </span>
    );
};

export default OutlineTag;