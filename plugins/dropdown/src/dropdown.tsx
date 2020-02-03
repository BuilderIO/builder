import { Builder } from '@builder.io/sdk'
import React, { useEffect, useState } from 'react'
import { InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'
import { getMassagedProps } from './dropdownPropsExtractor'
import axios from 'axios'

const compare = (a: any, b: any) => {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

export const D = () => {
  return <div>aws</div>
}

export const Dropdown = (props: any) => {
  const [selected, setSelected] = useState(props.value || '')
  const [selections, setSelections] = useState([])

  const onSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedValue = event.target.value
    setSelected(selectedValue)
    props.onChange(selectedValue)
  }

  const getSelections = async (url: any, mapper: Function) => {
    try {
      const response = await fetch(url)
      const data = await response.json()

      // const response = await axios.get(url)
      // const data = response.data
      const mappedSelections = mapper(data)
      mappedSelections.sort(compare)

      setSelections(mappedSelections)
    } catch (e) {
      console.error('Error', e)
    }
  }

  useEffect(() => {
    console.log('USE EFFECT')
    const { url, mapper } = getMassagedProps(props)
    console.log('TCL: url, mapper', url, mapper)
    getSelections(url, mapper)

    // const myMapper = (data: any) =>
    //   data.map((item: any) => ({
    //     name: item.name,
    //     key: item.mpvId
    //   }))
    // getSelections(url, myMapper)
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
