## Builder.io example using a strict custom design system in React

In this example we show how to integrate react components with [Builder.io](https://builder.io)

See the source code for the custom components used in this demo [here](src/components)

<img src="https://imgur.com/PJW3b4S.gif" alt="example" />

👉**Tip: want to limit page building to only your components? Try [components only mode](https://builder.io/c/docs/guides/components-only-mode)**

### To run the example Locally

- [Sign in or create an account](https://builder.io)
- Create new page
- From the command line

```bash
git clone https://github.com/BuilderIO/builder.git
cd examples/react-design-system
npm install
npm start
```

- Now that you have the development server running on localhost, point the Builder.io entry to it by assigning the preview URL to be : `http://localhost:3000/home`

<img width="796" alt="Screen Shot 2020-02-18 at 9 48 51 AM" src="https://user-images.githubusercontent.com/5093430/74763082-f5457100-5233-11ea-870b-a1b17c7f99fe.png">

When you deploy this to a live or staging environment, you can change the preview URL for your model globally from [builder.io/models](https://builder.io/models)
