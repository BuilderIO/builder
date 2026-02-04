import {
    Content,
    isPreviewing,
} from '@builder.io/sdk-react';
import { ComponentProps } from 'react';

type BuilderContentProps = Omit<ComponentProps<typeof Content>, 'content'> & {
    content: any;
}

export function RenderBuilderContent(props: BuilderContentProps) {
    // Always render the Content component - it handles the preview mode internally
    return <Content {...props} />
}