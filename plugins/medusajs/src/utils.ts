

export const transformProduct = ((resource: any) => ({
    ...resource,
    ...(resource.images && {
        image: {
            src: resource.images[0]?.url,
        },
    }),
}))

export const transformCollection = ((resource: any) => ({
    image: {
        src: 'https://avatars.githubusercontent.com/u/62591822',
    },
    ...resource,
}))

export const transformCategory = ((resource: any) => ({
    title: resource.name,
    image: {
        src: 'https://avatars.githubusercontent.com/u/62591822',
    },
    ...resource,
}))