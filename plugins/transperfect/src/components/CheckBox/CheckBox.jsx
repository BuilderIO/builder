import React from 'react';

export const CustomCheckbox = ({ checked, onChange }) => {
    const handleClick = () => {
        onChange({ target: { checked: !checked } });
    };

    const svgStyle = { width: '24px', height: '24px', fill: '#666' };

    return (
        <span onClick={handleClick} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
            {checked ? (
                <svg style={svgStyle} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <g>
                        <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                    </g>
                </svg>
            ) : (
                <svg style={svgStyle} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                </svg>
            )}
        </span>
    );
};
