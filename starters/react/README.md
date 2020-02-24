# Builder React Starter

This starter project will get you up and running fast with a React project with Builder.io visual page building + creation that you can customize and deploy anywhere.

## Quick start

### Prerequisites

Be sure you have [node.js](https://nodejs.org/en/) installed on your system

### Download and install

```
git clone https://github.com/BuilderIO/builder.git
cd builder/starters/react
npm install
```

### Make a free Builder.io account

Create a free account at [builder.io](https://builder.io) and grab your public API key from [builder.io/account/organization](https://builder.io/account/organization)

Paste your API key at the top of [src/App.js](src/App.js#5) for the value of the `API_KEY` variable

### Run the dev server

```
npm start
```

This will host your site at http://localhost:3000

### Create content in Builder

Head back over to [builder.io](https://builder.io), and create a new page with url /page-1 and publish it (green button in top right corner)

<img src="https://i.imgur.com/phgqvQa.jpg" alt="Creating a page">

Now go over to http://localhost:3000 to see your content live!

### Deploy

You can deploy your site with [many services](https://facebook.github.io/create-react-app/docs/deployment)

For a quick and easy deployment, create an account at [firebase.com](https://firebase.com)

Then from this project directory, run

```
npm install -g firebase-tools
firebase login
firebase init # be sure to choose "hosting" when prompted
npm run build
firebase deploy
```

And you are live!

For more detailed deployment instructions and options [see here](https://facebook.github.io/create-react-app/docs/deployment)

## Additional information

If you run into any issues here, don't hesitate to create a [Github issue](https://github.com/BuilderIO/builder/issues) or even email me directly at help@builder.io

This project wasa created by [create-react-app](https://facebook.github.io/create-react-app/docs/getting-started). For more information on commands and usage see their [docs here](https://facebook.github.io/create-react-app/docs/getting-started)
