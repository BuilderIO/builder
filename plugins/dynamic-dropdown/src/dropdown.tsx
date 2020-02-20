/** @jsx jsx */
import { jsx } from '@emotion/core'
import { Builder } from '@builder.io/sdk'
import React, { useEffect, useState } from 'react'
import { InputLabel, MenuItem, FormControl } from '@material-ui/core'
import Select from '@material-ui/core/Select'
import { getMassagedProps } from './dropdownPropsExtractor'
import { orchestrateSelections } from './selectionsOrchestrator'

export const Component = (props: any) => {
  const [selections, setSelections] = useState([])

  const onSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedValue = event.target.value || null
    console.log('eh?', selectedValue, event.target.value)
    props.onChange(selectedValue)
  }

  const updateSelections = async (url: any, mapper: String) => {
    try {
      const mappedSelections = await orchestrateSelections(url, mapper)

      setSelections(mappedSelections)
    } catch (e) {
      console.error('Error', e)
    }
  }

  useEffect(() => {
    const { url, mapper } = getMassagedProps(props)

    updateSelections(url, mapper)
  }, [props.context.designerState.editingContentModel?.data])

  return (
    <FormControl css={{ marginTop: 15 }} fullWidth variant="outlined">
      <InputLabel id="select-outlined-label">Dropdown</InputLabel>
      <Select
        fullWidth
        id="select-outlined"
        value={props.value ?? ''}
        onChange={onSelectChange}
      >
        <MenuItem key="None" value="None">
          None
        </MenuItem>
        {selections &&
          selections.map((selection: any, index: any) => (
            <MenuItem key={index} value={selection.value}>
              {selection.name}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  )
}

Builder.registerEditor({
  name: 'dynamic-dropdown',
  component: Component
})
