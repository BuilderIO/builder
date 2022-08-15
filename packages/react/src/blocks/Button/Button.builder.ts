import { Builder } from '@builder.io/sdk';
import { ButtonComponent } from './Button';
import {BUTTON_SCHEMA } from './Button.config'

Builder.registerComponent(ButtonComponent, BUTTON_SCHEMA)
