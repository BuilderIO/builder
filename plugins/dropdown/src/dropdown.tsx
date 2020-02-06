/** @jsx jsx */
import { jsx } from '@emotion/core'
import { Builder } from '@builder.io/sdk'
import React, { useEffect, useState } from 'react'
import { InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'
import { getMassagedProps } from './dropdownPropsExtractor'
import { safeEvaluate } from './mapperEvaluator'
import { executeGet } from './selectionsClient'

const comparer = (a: any, b: any) => {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

export const Dropdown = (props: any) => {
  const [selections, setSelections] = useState([])

  const onSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    // The selected value must be a valid JSON type (so must not be `undefined`)
    const selectedValue = event.target.value ?? null
    props.onChange(selectedValue)
  }

  const getSelections = async (url: any, mapper: String) => {
    try {
      const data = await executeGet(url)
      const mappedSelections = safeEvaluate(mapper, { data })
      if (mappedSelections.sort) mappedSelections.sort(comparer)

      setSelections(mappedSelections)
    } catch (e) {
      console.error('Error', e)
    }
  }

  useEffect(() => {
    const { url, mapper } = getMassagedProps(props)

    getSelections(url, mapper)
  }, [props.context.designerState.editingContentModel?.data])

  return (
    <FormControl css={{ marginTop: 15 }} fullWidth variant="outlined">
      <InputLabel id="select-outlined-label">Mpv Id</InputLabel>
      <Select
        fullWidth
        id="select-outlined"
        value={props.value ?? ''}
        onChange={onSelectChange}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {selections &&
          selections.map((selection: any, index: any) => (
            <MenuItem key={index} value={selection.key}>{selection.name}</MenuItem>
          ))}
      </Select>
    </FormControl>
  )
}

Builder.registerEditor({
  name: 'dropdown',
  component: Dropdown
})
