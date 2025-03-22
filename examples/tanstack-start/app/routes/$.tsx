import { createFileRoute } from '@tanstack/react-router'
import { Test } from '../components/test'
import { RenderBuilderContent } from '../components/builder'
import { fetchOneEntry, isPreviewing } from '@builder.io/sdk-react'
import { BUILDER_API_KEY } from '../utils/builder-init'
import { customComponents } from '../builder_registery'

export const Route = createFileRoute('/$')({
    loader: async ({params, location}) => {
        const splat = params._splat || ''
        const urlPath = '/' + splat
        
        // Get search params from the URL
        const searchParamsObj = new URLSearchParams(location.search)
        
        // Let Builder.io's isPreviewing handle all the preview logic
        const isInPreviewMode = isPreviewing(searchParamsObj)
        
        try {
            const content = await fetchOneEntry({
                model: 'page',
                apiKey: BUILDER_API_KEY,
                userAttributes: {
                    urlPath: urlPath
                },
                options: {
                    // This is important for preview mode
                    includeUnpublished: isInPreviewMode,
                    // Pass query params to Builder
                    query: Object.fromEntries(searchParamsObj.entries())
                }
            })
            
            return {
                content,
                isPreview: isInPreviewMode
            }
        } catch (error) {
            console.error('Builder.io fetch error:', error)
            return {
                content: null,
                isPreview: isInPreviewMode
            }
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const {content, isPreview} = Route.useLoaderData()
    return (
        <Test>
            <p>{isPreview ? 'Preview' : 'Not Preview'}</p>
            {(content || isPreview) ? (
                <RenderBuilderContent 
                    model='page' 
                    apiKey={BUILDER_API_KEY} 
                    content={content} 
                    customComponents={customComponents}
                />
            ) : (
                <div>
                    <h2>No Builder Content Found</h2>
                    <p>Create content for this URL in Builder.io to see it here.</p>
                </div>
            )}
        </Test>
    )
}
