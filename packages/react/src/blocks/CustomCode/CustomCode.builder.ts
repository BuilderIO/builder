import { Builder } from '@builder.io/sdk';
import { CustomCodeComponent } from './CustomCode';
import { CUSTOM_CODE_SCHEMA } from './CustomCode.config'

Builder.registerComponent(CustomCodeComponent, CUSTOM_CODE_SCHEMA)
