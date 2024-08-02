# Plugin to override built-in rich text

The built-in rich text editor (Quill) has certain limitations as it cannot insert HTML tags such as tables, videos, or special characters. This plugin uses a different rich text editor called [Jodit](https://xdsoft.net/jodit), which can extend to include many of the aforementioned HTML tags, thereby serving well when comprehensive content creation is needed.

Quill rich text editor
![quill](https://raw.githubusercontent.com/BuilderIO/builder/1cb988200026d6a57c17a8c758862e1c63191d12/plugins/jodit-html-editor/images/quill.png)

Jodit rich text editor
![jodit](https://raw.githubusercontent.com/BuilderIO/builder/1cb988200026d6a57c17a8c758862e1c63191d12/plugins/jodit-html-editor/images/jodit.png)

### How to run this plugin
1. Go to Account Settings
2. Click the pencil icon for Plugins to add the plugin.
3. Enter the address for this plugin: **@builder-io/html-plugin**
4. Click the Save button.

<img src="https://github.com/BuilderIO/builder/blob/1cb988200026d6a57c17a8c758862e1c63191d12/plugins/jodit-html-editor/images/add-plugin.gif?raw=true" alt="add-plugin" width="100%"/>


### How to run this plugin on local

```bash
git clone https://github.com/BuilderIO/builder.git
cd plugins/jodit-html-editor
npm install
```

Test plugin on local
```bash
npm run start
```

Build js file on production
```bash
npm run build
```
