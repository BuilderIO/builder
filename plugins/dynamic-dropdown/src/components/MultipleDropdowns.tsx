/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { getDependenciesKeyFrom } from '../helpers/getDependenciesKeyFrom';
import { orchestrateSelections } from '../helpers/selectionsOrchestrator';
import { Dropdown } from './Dropdown';
import { NothingToSelect } from './NothingToSelect';
import { haveDependenciesChanged } from '../helpers/dependenciesHelper';
import { IOption } from '../models/IOption';
import { canDisableClear } from '../helpers/canDisableClear';

export const MultipleDropdowns = (props: any) => {
  const [dropdownsOptions, setDropdownsOptions] = useState<{ [key: string]: IOption[] }>({});
  const [dropdownsSelectedOptions, setDropdownsSelectedOptions] = useState<{
    [key: string]: string | null;
  }>({});
  const [dimensions, setDimensions] = useState<string[]>([]);

  const onSelectChange = (selectedValue: string | null, label: string) => {
    const newSelections = {
      ...dropdownsSelectedOptions,
      [label]: selectedValue,
    };

    if (selectedValue == null) {
      delete newSelections[label];
    }

    setDropdownsSelectedOptions(newSelections);
    props.onChange(newSelections);
  };

  const cleanupSelections = () => {
    props.onChange(null);
    setDropdownsSelectedOptions({});
  };

  const updateDepencenciesKey = () => {
    props.dependenciesKeyRef.current = getDependenciesKeyFrom(props);
  };

  useEffect(() => {
    const updateSelections = async () => {
      try {
        const _dropdownsOptions = await orchestrateSelections(props);
        const _dimensions = Object.keys(_dropdownsOptions);
        setDimensions(_dimensions);
        setDropdownsOptions(_dropdownsOptions);
        if (haveDependenciesChanged(props)) {
          cleanupSelections();
          updateDepencenciesKey();
        } else {
          setDropdownsSelectedOptions(getCurrentDropdownSelections(props, _dimensions));
        }
      } catch (e) {
        console.error('Error', e);
      }
    };
    updateSelections();
  }, [props.newDependenciesKey]);

  if (!dimensions.length) {
    return <NothingToSelect name={props.field.name as string} />;
  }

  return (
    <div data-testid="MULTIPLE_DROPDOWNS">
      {dimensions.map((dimension: string) => {
        const selectedValue = props.value && props.value.get ? props.value.get(dimension) : '';
        return (
          <Dropdown
            key={dimension}
            disableClear={canDisableClear(props)}
            onSelectChange={onSelectChange}
            options={dropdownsOptions[dimension]}
            dimension={dimension}
            selectedValue={selectedValue}
          />
        );
      })}
    </div>
  );
};

const getCurrentDropdownSelections = (props: any, dimensions: string[]) => {
  const currentDropdownSelections: { [key: string]: string } = {};

  dimensions.forEach((key: string) => {
    if (props.value && props.value.get && props.value.get(key)) {
      currentDropdownSelections[key] = props.value.get(key);
    }
  });

  return currentDropdownSelections;
};
