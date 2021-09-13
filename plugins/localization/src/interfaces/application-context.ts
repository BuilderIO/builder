import {
  ApplicationContext,
  BuilderUser,
  ContentModel,
  Model,
} from '@builder.io/app-context'
import { BuilderElement, Component } from '@builder.io/sdk'

export interface ExtendedContentModel extends ContentModel {
  data: Map<string, any>
  url?: string
  previewUrl?: string
  allBlocks?: BuilderElement[]
}
export interface ExtendedApplicationContext extends ApplicationContext {
  user: {
    id: string
    getUser(id: string): Promise<BuilderUser | null>
    listUsers(): Promise<BuilderUser[]>
    authHeaders: { [key: string]: string }
    apiKey: string
    can(
      permissionType: 'editCode' | 'admin' | 'editDesigns' | 'createContent'
    ): boolean
    signOut(): void

    //@Aziz is there an up to date ApplicationContext type that contains the .organization key?
    organization: any
  }
  designerState: {
    editingContentModel: ExtendedContentModel | null
    draggingInItem: BuilderElement | Component | string | null
    undo(): Promise<void>
    redo(): Promise<void>
    canUndo: boolean
    canRedo: boolean
    xrayMode: boolean
    editingIframeRef: null | HTMLIFrameElement
    artboardSize: {
      width: number
    }
  }
  snackBar: {
    show: (str: string) => void
  }
  models: {
    result: Model[]
    update(model: Model): Promise<void>
    remove(model: Model): Promise<void>
  }
}
