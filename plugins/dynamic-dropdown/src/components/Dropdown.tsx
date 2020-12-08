import TextField from '@material-ui/core/TextField';
import React, { useEffect } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { IOption } from '../models/IOption';

export const Dropdown = (inputProps: any) => {
  const { onSelectChange, options, dimension, selectedValue, disableClear } = inputProps;

  if (!options || !options.length) {
    return <></>;
  }

  const currentlySelectedOption = getCurrentlySelectedOption(options, selectedValue);
  const selectedOptionName = getOptionName(currentlySelectedOption);

  const [inputValue, setInputValue] = React.useState(selectedOptionName);

  useEffect(() => {
    if (!selectedValue) {
      setInputValue('');
    }
  }, [selectedValue]);

  return (
    <div data-testid="DROPDOWN" style={{ paddingTop: 10 }}>
      <Autocomplete
        data-testid={dimension}
        fullWidth
        disablePortal
        disableClearable={!!disableClear}
        value={selectedValue}
        inputValue={inputValue}
        onBlur={() => setInputValue(selectedOptionName)}
        onInputChange={(event: any, newInputValue: string) => {
          event && setInputValue(safeToString(newInputValue));
        }}
        onChange={(event: any, selectedOption: IOption | null) => {
          if (!selectedOption) {
            if (canClearValue(disableClear, event)) {
              setInputValue('');
              onSelectChange(null, dimension);
            }
          } else {
            setInputValue(getOptionName(selectedOption));
            onSelectChange(selectedOption.value, dimension);
          }
        }}
        options={options}
        getOptionLabel={(option: IOption) => getOptionName(option)}
        renderInput={(params: any) => (
          <TextField {...params} label={dimension} variant="outlined" />
        )}
      />
    </div>
  );
};

function canClearValue(disableClear: any, event: any) {
  return !disableClear && event?.type === 'click';
}

function safeToString(value: string): string {
  return (value || '').toString();
}

function getOptionName(option: IOption | undefined | null) {
  let optionName = '';

  if (option) {
    optionName = safeToString(option.name);
  }

  return optionName;
}

function getCurrentlySelectedOption(options: IOption[], selectedValue: any) {
  return options.find((option: IOption) => option.value === selectedValue);
}
