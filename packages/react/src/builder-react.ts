import './scripts/init-editing';

import { builder, Builder } from '@builder.io/sdk';
export { BuilderElement } from '@builder.io/sdk';

Builder.isReact = true;

export { BuilderBlocks } from './components/builder-blocks.component';
export { BuilderBlock as BuilderBlockComponent } from './components/builder-block.component';
export { BuilderContent } from './components/builder-content.component';
import { BuilderComponent, onChange } from './components/builder-component.component';
export { BuilderStoreContext, BuilderStore } from './store/builder-store';
export { BuilderMetaContext } from './store/builder-meta';
export { BuilderAsyncRequestsContext } from './store/builder-async-requests';
export { BuilderBlock } from './decorators/builder-block.decorator';

export * from './functions/update-metadata';

export { withBuilder } from './functions/with-builder';
export { withChildren } from './functions/with-children';
export { noWrap } from './functions/no-wrap';

export { BuilderComponent as BuilderPage, onChange };
export { BuilderComponent };
export { BuilderComponent as RenderContent };

export { Text } from './blocks/Text';
export { Slot as Dropzone } from './blocks/Slot';
export { Fragment } from './blocks/Fragment';
export { Columns } from './blocks/Columns';
export { Embed } from './blocks/Embed';
export { CustomCode } from './blocks/CustomCode';
export { Image, getSrcSet } from './blocks/Image';
export { Video } from './blocks/Video';
export { Symbol } from './blocks/Symbol';
export { Button } from './blocks/Button';
export { Section } from './blocks/Section';
export { StateProvider } from './blocks/StateProvider';
export { Router } from './blocks/Router';
export { Mutation } from './blocks/Mutation';

export { Form } from './blocks/forms/Form';
export { FormInput } from './blocks/forms/Input';
export { FormSubmitButton } from './blocks/forms/Button';
export { Label } from './blocks/forms/Label'; // advanced?
export { FormSelect } from './blocks/forms/Select'; // advanced?
export { TextArea } from './blocks/forms/TextArea';
export { Img } from './blocks/raw/Img';
export { RawText } from './blocks/raw/RawText';

export { stringToFunction } from './functions/string-to-function';

export { builder, Builder };
export default builder;
