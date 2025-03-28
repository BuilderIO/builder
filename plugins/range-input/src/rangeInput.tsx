import React from "react";
import { useObserver } from "mobx-react";

interface Props<T> {
  value?: T;
  onChange(newValue: T): void;
}

export function RangeInputEditor(props: Props<number>) {
  return useObserver(() => {
    const value = props.value || 1;
    function getStep() {
      if (value > 10) {
        return 10;
      }
      if (value > 1) {
        return 1;
      }
      if (value > 0.1) {
        return 0.1;
      }
      return 0.01;
    }

    return (
      <div
        style={{
          marginTop: 10,
          marginBottom: 10,
          display: "flex",
        }}
      >
        <input
          style={{
            flexGrow: 1,
            height: 6,
            marginTop: 12,
          }}
          type="range"
          min={0.01}
          max={10}
          step={getStep() / 10}
          value={value}
          onChange={(e) => props.onChange(e.target.valueAsNumber)}
        />
        <input
          style={{
            background: "var(--off-background-4)",
            borderRadius: 5,
            marginLeft: 5,
            padding: "5px 7px",
            border: "1px solid var(--off-background-3)",
          }}
          type="number"
          min={0.01}
          max={10}
          step={getStep()}
          value={value}
          onChange={(e) => props.onChange(e.target.valueAsNumber)}
        />
      </div>
    );
  });
}