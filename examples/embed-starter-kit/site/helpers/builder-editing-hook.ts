import { builder } from '@builder.io/sdk'
import { useEffect, useState } from 'react'

export function builderEditing() {
  const [builderEditing, setBuilderEditing] = useState<string | null>(null)

  useEffect(() => {
    if (builder.editingModel) {
      setBuilderEditing(builder.editingModel)
    }
  }, [])

  return builderEditing
}
