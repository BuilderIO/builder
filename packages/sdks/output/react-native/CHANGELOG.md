### 0.0.1-44

Changes:
- Fixes `getAllContent` to traverse all nested data from symbols/references https://github.com/BuilderIO/builder/pull/718
- Fixes `getContent` (broken due to missing URL polyfill) https://github.com/BuilderIO/builder/pull/880
- Strips invalid `this.` left from Mitosis compilation https://github.com/BuilderIO/builder/pull/717/commits/b1947c86db769f74a7408965dac70f22dfcc538d
- Fix identification of react-native environment https://github.com/BuilderIO/builder/pull/717/commits/9d2a207ceca39bf83d5bbdc4bd67351e86105d78
- Fix Aspect Ratio handling (this adds support for Pixel Tracking) https://github.com/BuilderIO/builder/pull/749, preceeded by https://github.com/BuilderIO/builder/pull/687
