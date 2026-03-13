# BetterQuill - Builder.io Plugin

> A superior rich text editing experience for Builder.io, surpassing the default Quill integration with modern features and professional UI.

**BetterQuill** is a comprehensive Quill.js-based rich text editor plugin for Builder.io that provides everything the default plugin offers and more — with advanced features including professional table management, dark/light themes, fullscreen editing, and a powerful CodeMirror-powered HTML code editor.

## Why BetterQuill?

The default Quill plugin in Builder.io is basic. **BetterQuill** takes it to the next level with:

✅ **Professional UI/UX** - Modern, polished interface with smooth animations  
✅ **Dark & Light Modes** - Perfect contrast with `#191919` dark theme  
✅ **Advanced Tables** - Full table editor with merge/split cells (powered by quill-better-table)  
✅ **Code View** - Professional HTML editor with CodeMirror 6, syntax highlighting, and auto-formatting  
✅ **Fullscreen Mode** - Distraction-free editing with centered 800px content area  
✅ **Better Typography** - Improved spacing, line heights, and readability  
✅ **Modern Controls** - Sleek buttons with hover effects and visual feedback  

## Features

### 📝 Text Formatting
- **Headers**: H1-H6 heading styles with proper contrast
- **Text Styles**: Bold, Italic, Underline, Strikethrough
- **Colors**: Full color picker for text and background highlighting
- **Alignment**: Left, Center, Right, Justify
- **Superscript/Subscript**: Scientific notation support

### 📋 Content Elements
- **Lists**: Ordered, Bullet, and Checklist
- **Indentation**: Increase/Decrease indent levels
- **Blockquotes**: Quote formatting with accent border
- **Code Blocks**: Inline code with modern styling
- **Links**: Hyperlink management
- **Images**: Insert and manage images
- **Videos**: Embed video content

### 🎨 Advanced Features

#### Tables (quill-better-table)
Full-featured table editor with context menu:
- Insert/delete rows and columns
- Merge and split cells
- Right-click context menu for all operations
- Clean, professional table styling

#### Dark & Light Modes
- **Dark Mode**: Professional `#191919` background with white text and perfect contrast
- **Light Mode**: Clean white background with dark text
- Consistent theming across all UI elements
- Smooth theme transitions

#### Fullscreen Mode
- Distraction-free editing experience
- Centered content area (800px max-width)
- Full viewport height with `100svh`
- Maintains theme and functionality

#### Code View (CodeMirror 6)
Professional HTML source editor:
- **Syntax Highlighting**: Full HTML syntax coloring
- **Auto-Formatting**: Beautiful code with proper indentation (js-beautify)
- **Line Numbers**: Professional gutter display
- **Editable**: Make changes directly in source code
- **Theme Support**: One Dark theme in dark mode

### 🎨 Modern UI Design
- Smooth transitions and hover effects
- Clean button design with visual feedback
- Custom styled scrollbars
- Professional spacing and typography
- Visible borders with `#393939` in dark mode
- Centered toolbar icons with flexbox
- Glass morphism effects on control bar

## Installation

1. **Install Dependencies**

```bash
npm install
```

2. **Start Development Server**

```bash
npm start
```

The plugin will be available at `http://localhost:1268/plugin.system.js`

3. **Build for Production**

```bash
npm run build
```

The production build will be in the `dist` folder.

## Adding the Plugin to Builder.io

### Local Development

1. Start the development server: `npm start`
2. Go to [Builder.io Account Settings](https://builder.io/account/settings)
3. Click the pencil icon next to "Plugins"
4. Add the local URL: `http://localhost:1268/plugin.system.js`
5. Click Save

**Note for Chrome Users**: When developing locally on `http://localhost`, you need to allow insecure content:
- Click the shield icon in the address bar
- Select "Load unsafe scripts"
- The page will reload

### Using the Plugin

1. Go to **Models** in Builder.io
2. Select or create a model
3. Click **+ New Field**
4. In the **Type** dropdown, scroll down and select **RichText**
5. The rich text editor will appear with all features

## Plugin Features Guide

### 🌙 Dark Mode
Click the **🌙 Dark** button to toggle between light and dark themes. This provides better visibility in different lighting conditions.

### ⛶ Fullscreen Mode
Click the **⛶ Fullscreen** button to expand the editor to full screen for focused, distraction-free editing.

### </> Code View
Click the **</> Code** button to toggle between:
- **Visual Editor**: WYSIWYG editing experience
- **HTML Source**: Direct HTML code editing for advanced users

### ⊞ Tables
Click the **⊞** button in the toolbar to insert a 3x3 table. Right-click on any cell to:
- Insert rows above/below
- Insert columns left/right
- Merge/unmerge cells
- Delete rows/columns/table

## Technical Details

### Core Dependencies
- **Quill 2.0+**: Modern WYSIWYG editor
- **quill-better-table**: Advanced table management with merge/split
- **CodeMirror 6**: Professional code editor for HTML view
- **js-beautify**: HTML auto-formatting and indentation
- **@builder.io/react**: Builder.io React SDK
- **@emotion/core**: CSS-in-JS styling

### Key Technologies
- **React**: Component-based architecture
- **Webpack**: Module bundling and dev server
- **System.js**: Dynamic module loading for Builder.io
- **CSS-in-JS**: Dynamic theming with emotion

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Customization

BetterQuill is designed to be customizable. Edit `src/plugin.jsx` to modify:

- **Toolbar Options**: Customize the `toolbarOptions` array
- **Theme Colors**: Adjust dark/light mode colors in `containerStyles`
- **Editor Behavior**: Modify Quill modules and settings
- **UI Styling**: Update CSS-in-JS for buttons, borders, and spacing

## Troubleshooting

### Plugin Not Loading
1. Verify the development server is running on port 1268
2. Check browser console for errors
3. Ensure you've allowed insecure scripts in Chrome (see installation notes)
4. Confirm Builder.io plugin URL is correct

### Code View Not Working
1. Ensure all CodeMirror dependencies are installed
2. Check that js-beautify is properly installed
3. Clear browser cache and rebuild

### Styling Issues
1. Clear your browser cache
2. Rebuild the plugin: `npm run build`
3. Refresh Builder.io
4. Check for CSS conflicts in browser DevTools

## Author

**Matan Dessaur** (M8N-MatanDessaur)  
📧 [hello@matandessaur.me](mailto:hello@matandessaur.me)

## License

ISC License - Free to use and modify

## Support & Contributing

For issues, questions, or contributions:
- 📧 Email: [hello@matandessaur.me](mailto:hello@matandessaur.me)
- 📚 [Builder.io Documentation](https://www.builder.io/c/docs)
- 📖 [Quill.js Documentation](https://quilljs.com/docs/)

---

**BetterQuill** - Because your content deserves better. 🚀
