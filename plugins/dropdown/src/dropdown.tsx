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
  const [selected, setSelected] = useState(props.value || '')
  const [selections, setSelections] = useState([])

  const onSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedValue = event.target.value
    setSelected(selectedValue)
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
  }, [props.context.designerState.editingContentModel.data])

  return (
    <FormControl variant="outlined">
      <InputLabel id="select-outlined-label">Mpv Id</InputLabel>
      <Select id="select-outlined" value={selected} onChange={onSelectChange}>
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {selections &&
          selections.map((selection: any) => (
            <MenuItem value={selection.key}>{selection.name}</MenuItem>
          ))}
      </Select>
    </FormControl>
  )
}

Builder.registerEditor({
  name: 'dropdown',
  component: Dropdown
})
