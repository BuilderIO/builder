import { Builder, Component, builder } from '@builder.io/sdk'

export function restrictedRegister(
  component: any,
  options: Component,
  models: string[]
) {
  if (!Builder.isEditing || models.includes(builder.editingModel!)) {
    return Builder.registerComponent(component, options)
  }
}
