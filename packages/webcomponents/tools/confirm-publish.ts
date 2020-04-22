const inquirer = require('inquirer')

const promptUser = async () => {
  console.log(process.argv0)

  const response = await inquirer.prompt([
    {
      name: 'prompt',
      message:
        '!!!WARNING!!! Do not run npm publish directly.\n Did you run a publish script like `npm run release:dev`?'
    }
  ])

  if (response.prompt !== 'yes') {
    console.log('You must run a publish script! Exiting now.')
    process.exit(1)
  }
}

promptUser()
