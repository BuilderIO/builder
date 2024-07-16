# Plugin to override built-in rich text

The built-in rich text editor (Quill) has certain limitations as it cannot insert HTML tags such as tables, videos, or special characters. This plugin uses a different rich text editor called [Jodit](https://xdsoft.net/jodit), which can extend to include many of the aforementioned HTML tags, thereby serving well when comprehensive content creation is needed.

Quill rich text editor
![quill](https://raw.githubusercontent.com/BuilderIO/builder/453433ebce30338771b2ef19ef7506f872575033/plugins/html-editor/images/quill.png)

Jodit rich text editor
![jodit](https://raw.githubusercontent.com/BuilderIO/builder/453433ebce30338771b2ef19ef7506f872575033/plugins/html-editor/images/jodit.png)

### How to run this plugin
1. Go to Account Settings
2. Click the pencil icon for Plugins to add the plugin.
3. Enter the address for this plugin: **@builder-io/html-plugin**
4. Click the Save button.

<img src="https://raw.githubusercontent.com/BuilderIO/builder/453433ebce30338771b2ef19ef7506f872575033/plugins/html-editor/images/add-plugin.gif" alt="add-plugin" width="100%"/>


### How to run this plugin on local

```bash
git clone https://github.com/BuilderIO/builder.git
cd plugins/html-editor
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
Video demo on local (Using node version 16.18.0) [here](https://drive.google.com/file/d/1b_f4hLewbHUH_KfxxijWzuVEmNas29xk/view)
