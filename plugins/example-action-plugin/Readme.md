In this example code, we define an `action shortcut` to trigger events to Google Analytics on specified element events (`submit`, `click`, etc.)

## Getting started

```
git clone git@github.com:BuilderIO/builder.git
cd builder/plugins/example-action-plugin/
npm install
npm run start
```

then configure Builder to load this plugin from localhost:

- Go to to your space settings > plugins
  and add `http://localhost:1268/plugin.system.js` to the list
  <img width="820" alt="Screen Shot 2022-04-08 at 1 42 16 PM" src="https://user-images.githubusercontent.com/5093430/162527233-a1497525-b48b-4c98-98a4-0954142b4dda.png">

You should be able to see this example in action.

## What are action shortcuts?

<img width="547" alt="Screen Shot 2022-04-08 at 1 34 34 PM" src="https://user-images.githubusercontent.com/5093430/162526704-0baec86b-06bd-4a97-8aa4-2233e7c6a5b7.png">

Action shortcuts in Builder are a great way to simplify some of the tasks that would otherwise require developer involvement, using action shortcuts a content creator can trigger tracking events, set up conditional values, or set specific values on state without having to write code, see `src/plugin.tsx` for a detailed example.

<img width="477" alt="Screen Shot 2022-04-08 at 1 29 25 PM" src="https://user-images.githubusercontent.com/5093430/162527958-266881c3-ec82-4208-a804-d60b64e12c82.png">
