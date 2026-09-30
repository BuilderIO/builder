import type {
  BuilderRenderState,
  RegisteredComponent,
  RegisteredComponents,
} from '../../context/types.js';
import { serializeIncludingFunctions } from '../../functions/register-component.js';
import { copyPlainData } from '../../helpers/copy-plain-data.js';
import type { BuilderContent } from '../../types/builder-content.js';
import type { ComponentInfo } from '../../types/components.js';
import type { Dictionary, Nullable } from '../../types/typescript.js';
import type { ContentProps } from './content.types.js';

// Registrations are usually module constants, so their derived forms are built once per object.
const SERIALIZED_COMPONENT_INFOS = new WeakMap<object, ComponentInfo>();
const REGISTERED_COMPONENT_ENTRIES = new WeakMap<object, RegisteredComponent>();

const getSerializedComponentInfo = (
  registration: RegisteredComponent
): ComponentInfo => {
  const cached = SERIALIZED_COMPONENT_INFOS.get(registration);
  if (cached) return cached;
  const { component: _, ...rest } = registration;
  const info: ComponentInfo = serializeIncludingFunctions(
    rest as ComponentInfo
  );
  SERIALIZED_COMPONENT_INFOS.set(registration, info);
  return info;
};

export const getRegisteredComponents = (
  registrations: RegisteredComponent[],
  wrapComponent: (component: any) => any
): RegisteredComponents => {
  const registeredComponents: RegisteredComponents = {};
  for (const registration of registrations) {
    let entry = REGISTERED_COMPONENT_ENTRIES.get(registration);
    if (!entry) {
      entry = {
        component: wrapComponent(registration.component),
        ...getSerializedComponentInfo(registration),
      } as RegisteredComponent;
      REGISTERED_COMPONENT_ENTRIES.set(registration, entry);
    }
    registeredComponents[registration.name] = entry;
  }
  return registeredComponents;
};

export const getComponentInfos = (
  registrations: RegisteredComponent[]
): Dictionary<ComponentInfo> => {
  const componentInfos: Dictionary<ComponentInfo> = {};
  for (const registration of registrations) {
    componentInfos[registration.name] =
      getSerializedComponentInfo(registration);
  }
  return componentInfos;
};

export const getRootStateInitialValue = ({
  content,
  data,
  locale,
}: Pick<ContentProps, 'content' | 'data' | 'locale'>) => {
  const defaultValues: BuilderRenderState = {};

  const seen = new WeakMap<object, any>();
  const initialState = copyPlainData(content?.data?.state || {}, seen);

  // set default values for content state inputs
  content?.data?.inputs?.forEach((input) => {
    if (input.name && input.defaultValue !== undefined) {
      defaultValues[input.name] = copyPlainData(input.defaultValue, seen);
    }
  });

  return {
    ...defaultValues,
    ...initialState,
    ...data,
    ...(locale ? { locale } : {}),
  };
};

export const getContentInitialValue = ({
  content,
  data,
}: Pick<ContentProps, 'content' | 'data'>): Nullable<BuilderContent> => {
  return !content
    ? undefined
    : {
        ...content,
        data: {
          ...content?.data,
          ...data,
        },
        meta: content?.meta,
      };
};
