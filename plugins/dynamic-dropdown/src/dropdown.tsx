/** @jsx jsx */
import { jsx } from '@emotion/core'
import { Builder } from '@builder.io/sdk'
import React, { useEffect, useState } from 'react'
import { MenuItem } from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import { getMassagedProps } from './dropdownPropsExtractor'
import { orchestrateSelections } from './selectionsOrchestrator'

export const Component = (props: any) => {
  const [selections, setSelections] = useState([])

  const onSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedValue = event.target.value ?? null
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
    <TextField
      select
      label="Dropdown"
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
    </TextField>
  )
}

Builder.registerEditor({
  name: 'dynamic-dropdown',
  component: Component
})
