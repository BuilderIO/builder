// @ts-ignore
import React from 'react';
import { Component } from '../src/components/index';
import { render, waitForDomChange, cleanup, act, wait } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';
import { orchestrateSelections } from '../src/helpers/selectionsOrchestrator';
import { IOption } from '../src/models/IOption';

let autocompleteInput: any = {};
jest.mock('@material-ui/lab/Autocomplete', () => (props: any) => {
  const { value, onChange, options, inputValue, onBlur } = props;
  const handleChange = (event: any) => {
    onChange(event, event.target.value);
  };

  autocompleteInput[props['data-testid']] = inputValue;

  return (
    <div>
      <select
        data-testid={props['data-testid']}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
      >
        {options.map((option: IOption) => (
          <div>
            <div>{option.name}</div>
            <div>{option.value}</div>
          </div>
        ))}
      </select>
    </div>
  );
});

describe('Dropdown plugin', () => {
  let dropdownProps: any;

  beforeEach(() => {
    jest.resetAllMocks();
    autocompleteInput = {};

    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
      oneDimension: [
        { name: 'aName1', value: 'aValue1' },
        { name: 'anotherName1', value: 'anotherValue1' },
      ],
      anotherDimension: [
        { name: 'aName2', value: 'aValue2' },
        { name: 'anotherName2', value: 'anotherValue2' },
      ],
    });

    dropdownProps = {
      context: { designerState: {} },
      object: { get: jest.fn() },
      onChange: jest.fn(),
      field: { options: {}, name: 'A_NAME' },
    };
  });

  afterEach(cleanup);

  describe('When loading without previous selected values', () => {
    describe('And expect single dropdown', () => {
      it('should show empty input', async () => {
        await act(async () => {
          render(
            <Component
              {...{
                ...dropdownProps,
                value: '',
                field: { options: { expectMultipleDropdowns: false } },
              }}
            />
          );
          await waitForDomChange();

          expect(autocompleteInput['oneDimension']).toEqual('');
        });
      });
      describe('when on blur', () => {
        it('should still show empty input', async () => {
          await act(async () => {
            const { queryByTestId } = render(
              <Component
                {...{
                  ...dropdownProps,
                  value: '',
                  field: { options: { expectMultipleDropdowns: false } },
                }}
              />
            );
            await waitForDomChange();

            const element: any = queryByTestId('oneDimension');
            Simulate.blur(element);
            expect(autocompleteInput['oneDimension']).toEqual('');
          });
        });
      });
    });

    describe('And expect multiple dropdowns', () => {
      it('should show empty input', async () => {
        await act(async () => {
          render(
            <Component
              {...{
                ...dropdownProps,
                value: { get: () => '' },
                field: { options: { expectMultipleDropdowns: true } },
              }}
            />
          );
          await waitForDomChange();

          expect(autocompleteInput['oneDimension']).toEqual('');
          expect(autocompleteInput['anotherDimension']).toEqual('');
        });
      });
    });
  });

  describe('When loading with previous selected values', () => {
    describe('And expect single dropdown', () => {
      it('should show the name matching the value in the option', async () => {
        await act(async () => {
          render(
            <Component
              {...{
                ...dropdownProps,
                value: 'aValue1',
                field: { options: { expectMultipleDropdowns: false } },
              }}
            />
          );
          await waitForDomChange();

          expect(autocompleteInput['oneDimension']).toEqual('aName1');
        });
      });

      describe('when on blur', () => {
        it('should keep the name of the selected value', async () => {
          await act(async () => {
            const { queryByTestId } = render(
              <Component
                {...{
                  ...dropdownProps,
                  value: 'aValue1',
                  field: { options: { expectMultipleDropdowns: false } },
                }}
              />
            );
            await waitForDomChange();

            const element: any = queryByTestId('oneDimension');
            Simulate.blur(element);
            expect(autocompleteInput['oneDimension']).toEqual('aName1');
          });
        });
      });
    });

    describe('And expect single dropdown', () => {
      it('should show the name matching the value in the option', async () => {
        const get = (key: string) => {
          if (key === 'oneDimension') return 'aValue1';
          if (key === 'anotherDimension') return '';
        };
        await act(async () => {
          render(
            <Component
              {...{
                ...dropdownProps,
                value: { get },
                field: { options: { expectMultipleDropdowns: true } },
              }}
            />
          );
          await waitForDomChange();

          expect(autocompleteInput['oneDimension']).toEqual('aName1');
          expect(autocompleteInput['anotherDimension']).toBe('');
        });
      });
    });
  });

  it('Shows only the first dimension if expectMultipleDropdowns is false', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
      oneDimension: [
        { name: 'aName1', value: 'aValue1' },
        { name: 'anotherName1', value: 'anotherValue1' },
      ],
      anotherDimension: [
        { name: 'aName2', value: 'aValue2' },
        { name: 'anotherName2', value: 'anotherValue2' },
      ],
    });

    await act(async () => {
      const { queryAllByTestId } = render(
        <Component
          {...{ ...dropdownProps, field: { options: { expectMultipleDropdowns: false } } }}
        />
      );
      await waitForDomChange();

      expect(queryAllByTestId('oneDimension')).toHaveLength(1);
      expect(queryAllByTestId('anotherDimension')).toHaveLength(0);
    });
  });

  it('updates state with values from all dropdowns', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
      oneDimension: [
        { name: 'aName1', value: 'aValue1' },
        { name: 'anotherName1', value: 'anotherValue1' },
      ],
      anotherDimension: [
        { name: 'aName2', value: 'aValue2' },
        { name: 'anotherName2', value: 'anotherValue2' },
      ],
    });

    await act(async () => {
      const { queryByTestId } = render(
        <Component
          {...{ ...dropdownProps, field: { options: { expectMultipleDropdowns: true } } }}
        />
      );
      await waitForDomChange();
      const element: any = queryByTestId('oneDimension');
      const evt: any = { target: { value: { name: 'aName1', value: 'aValue1' } } };
      Simulate.change(element, evt);

      expect(dropdownProps.onChange).toHaveBeenCalledWith({ oneDimension: 'aValue1' });

      const evt2: any = { target: { value: { name: 'anotherName1', value: 'anotherValue1' } } };
      Simulate.change(element, evt2);

      expect(dropdownProps.onChange).toHaveBeenCalledWith({ oneDimension: 'anotherValue1' });

      const element2: any = queryByTestId('anotherDimension');
      const evt3: any = { target: { value: { name: 'anotherName2', value: 'anotherValue2' } } };
      Simulate.change(element2, evt3);

      expect(dropdownProps.onChange).toHaveBeenCalledWith({
        oneDimension: 'anotherValue1',
        anotherDimension: 'anotherValue2',
      });
    });
  });

  it('return only value when expectMultipleDropdowns is disabled', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
      oneDimension: [
        { name: 'aName1', value: 'aValue1' },
        { name: 'anotherName1', value: 'anotherValue1' },
      ],
    });

    await act(async () => {
      const { queryByTestId } = render(
        <Component
          {...{ ...dropdownProps, field: { options: { expectMultipleDropdowns: false } } }}
        />
      );
      await waitForDomChange();
      const element: any = queryByTestId('oneDimension');
      const evt: any = { target: { value: { name: 'aName1', value: 'aValue1' } } };
      Simulate.change(element, evt);

      expect(dropdownProps.onChange).toHaveBeenCalledWith('aValue1');
    });
  });

  it('does not show any dropdown, but a nothing to select text, when there are no dropdownsOptions', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({});

    const { queryByTestId } = render(<Component {...dropdownProps} />);

    expect(queryByTestId('DROPDOWN')).not.toBeInTheDocument();
    expect(queryByTestId('NOTHING_TO_SELECT')).toBeInTheDocument();
  });

  it('does not show any dropdown, but a nothing to select text, when orchestrate selections fails', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockRejectedValue('ERROR');

    const { queryByTestId } = render(<Component {...dropdownProps} />);

    expect(queryByTestId('DROPDOWN')).not.toBeInTheDocument();
    expect(queryByTestId('NOTHING_TO_SELECT')).toBeInTheDocument();
  });

  it('dependency values change when re-renders', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockImplementation((props: any) => {
      if (props.object.get() === 'dependency-value-1') {
        return { oneDimension: [{ name: 'aName1', value: 'aValue1' }] };
      }

      if (props.object.get() === 'dependency-value-2') {
        return { twoDimension: [{ name: 'aName2', value: 'aValue2' }] };
      }
    });

    const componentFirstProps = {
      ...dropdownProps,
      object: { get: () => 'dependency-value-1' },
      field: { options: { dependencyComponentVariables: ['dependency'] } },
    };

    const { queryByTestId, rerender, queryByText } = render(<Component {...componentFirstProps} />);

    await waitForDomChange();

    expect(queryByText('aName1')).toBeInTheDocument();
    expect(queryByText('aName2')).not.toBeInTheDocument();

    const componentSecondProps = {
      ...dropdownProps,
      object: { get: () => 'dependency-value-2' },
      field: { options: { dependencyComponentVariables: ['dependency'] } },
    };

    rerender(<Component {...componentSecondProps} />);

    await waitForDomChange();

    expect(queryByText('aName1')).not.toBeInTheDocument();
    expect(queryByText('aName2')).toBeInTheDocument();

    expect(queryByTestId('oneDimension')).not.toBeInTheDocument();
    expect(queryByTestId('twoDimension')).toBeInTheDocument();
  });

  it('calls builder props.onChange with null when re-renders with different dependencyComponentVariables values', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockImplementation((props: any) => {
      if (props.object.get() === 'dependency-value-1') {
        return { oneDimension: [{ name: 'aName1', value: 'aValue1' }] };
      }

      if (props.object.get() === 'dependency-value-2') {
        return { twoDimension: [{ name: 'aName2', value: 'aValue2' }] };
      }
    });

    const componentFirstProps = {
      ...dropdownProps,
      object: { get: () => 'dependency-value-1' },
      field: { options: { dependencyComponentVariables: ['dependency'] } },
    };

    const { rerender } = render(<Component {...componentFirstProps} />);

    await waitForDomChange();

    expect(dropdownProps.onChange).not.toHaveBeenCalledWith(null);

    const componentSecondProps = componentFirstProps;

    rerender(<Component {...componentSecondProps} />);

    await wait(() => {}, { timeout: 1000 });

    expect(dropdownProps.onChange).not.toHaveBeenCalledWith(null);

    const componentThirdProps = {
      ...dropdownProps,
      object: { get: () => 'dependency-value-2' },
      field: { options: { dependencyComponentVariables: ['dependency'] } },
    };

    rerender(<Component {...componentThirdProps} />);

    await wait(() => {}, { timeout: 1000 });

    expect(dropdownProps.onChange).toHaveBeenCalledWith(null);
  });

  it('does not keep previous selected values when re-renders', async () => {
    (orchestrateSelections as jest.Mock) = jest.fn().mockImplementation((props: any) => {
      if (props.object.get() === 'dependency-value-1') {
        return {
          oneDimension: [{ name: 'aName1', value: 'aValue1' }],
          oneMoreDimension: [{ name: 'moreName1', value: 'moreValue1' }],
        };
      }

      if (props.object.get() === 'dependency-value-2') {
        return { twoDimension: [{ name: 'aName2', value: 'aValue2' }] };
      }
    });

    const componentFirstProps = {
      ...dropdownProps,
      object: { get: () => 'dependency-value-1' },
      field: {
        options: { dependencyComponentVariables: ['dependency'], expectMultipleDropdowns: true },
      },
    };

    const { queryByTestId, rerender } = render(<Component {...componentFirstProps} />);

    await waitForDomChange();

    const element: any = queryByTestId('oneDimension');
    const evt: any = { target: { value: { name: 'aName1', value: 'aValue1' } } };
    Simulate.change(element, evt);

    expect(dropdownProps.onChange).toHaveBeenCalledWith({ oneDimension: 'aValue1' });

    const element2: any = queryByTestId('oneMoreDimension');
    const evt2: any = { target: { value: { name: 'moreName1', value: 'moreValue1' } } };
    Simulate.change(element2, evt2);

    expect(dropdownProps.onChange).toHaveBeenCalledWith({
      oneDimension: 'aValue1',
      oneMoreDimension: 'moreValue1',
    });

    const componentSecondProps = {
      ...dropdownProps,
      object: { get: () => 'dependency-value-2' },
      field: {
        options: { dependencyComponentVariables: ['dependency'], expectMultipleDropdowns: true },
      },
    };

    rerender(<Component {...componentSecondProps} />);

    await waitForDomChange();

    const element3: any = queryByTestId('twoDimension');
    const evt3: any = { target: { value: { name: 'aName2', value: 'aValue2' } } };
    Simulate.change(element3, evt3);

    expect(dropdownProps.onChange).toHaveBeenCalledWith({ twoDimension: 'aValue2' });
  });

  describe('When expecting multiple dropdowns', () => {
    it('shows multiple dropdowns with multiple options', async () => {
      (orchestrateSelections as jest.Mock) = jest.fn().mockResolvedValue({
        oneDimension: [
          { name: 'aName1', value: 'aValue1' },
          { name: 'anotherName1', value: 'anotherValue1' },
        ],
        anotherDimension: [
          { name: 'aName2', value: 'aValue2' },
          { name: 'anotherName2', value: 'anotherValue2' },
        ],
      });

      const { getByText, queryByTestId } = render(
        <Component
          {...{ ...dropdownProps, field: { options: { expectMultipleDropdowns: true } } }}
        />
      );
      await waitForDomChange();

      expect(queryByTestId('MULTIPLE_DROPDOWNS')).toBeInTheDocument();
      expect(queryByTestId('SINGLE_DROPDOWN')).not.toBeInTheDocument();

      expect(getByText('aName1')).toBeInTheDocument();
      expect(getByText('anotherName1')).toBeInTheDocument();
      expect(getByText('aName2')).toBeInTheDocument();
      expect(getByText('anotherName2')).toBeInTheDocument();
    });
  });

  describe('When expecting single dropdowns', () => {
    it('should show a single dropdown', async () => {
      const { queryByTestId } = render(
        <Component
          {...{ ...dropdownProps, field: { options: { expectMultipleDropdowns: false } } }}
        />
      );

      await waitForDomChange();

      expect(queryByTestId('MULTIPLE_DROPDOWNS')).not.toBeInTheDocument();
      expect(queryByTestId('SINGLE_DROPDOWN')).toBeInTheDocument();
    });
  });

  describe('When cleanup is requested', () => {
    describe('and disableCleanup is true', () => {
      it('should not clean selected value', async () => {
        const { queryByTestId } = render(
          <Component
            {...{ ...dropdownProps, value: 'aValue1', field: { options: { disableClear: true } } }}
          />
        );

        await waitForDomChange();

        expect(autocompleteInput['oneDimension']).toEqual('aName1');

        const element: any = queryByTestId('oneDimension');
        const cleanEvt: any = { type: 'click', target: { value: null } };
        Simulate.change(element, cleanEvt);

        expect(dropdownProps.onChange).not.toHaveBeenCalledWith(null);
      });
    });

    describe('and disableCleanup is false', () => {
      it('should clean selected value', async () => {
        const { queryByTestId } = render(
          <Component
            {...{ ...dropdownProps, value: 'aValue1', field: { options: { disableClear: false } } }}
          />
        );

        await waitForDomChange();

        expect(autocompleteInput['oneDimension']).toEqual('aName1');

        const element: any = queryByTestId('oneDimension');
        const cleanEvt: any = { type: 'click', target: { value: null } };
        Simulate.change(element, cleanEvt);

        expect(dropdownProps.onChange).toHaveBeenCalledWith(null);
      });
    });
  });
});
