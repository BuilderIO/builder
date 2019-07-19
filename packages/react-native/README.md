
# @builder.io/react-native

## Getting started

`$ npm install @builder.io/react-native --save`

### Mostly automatic installation

`$ react-native link @builder.io/react-native`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `@builder.io/react-native` and add `RNReactNative.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNReactNative.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNReactNativePackage;` to the imports at the top of the file
  - Add `new RNReactNativePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':@builder.io/react-native'
  	project(':@builder.io/react-native').projectDir = new File(rootProject.projectDir, 	'../node_modules/@builder.io/react-native/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':@builder.io/react-native')
  	```

#### Windows
[Read it! :D](https://github.com/ReactWindows/react-native)

1. In Visual Studio add the `RNReactNative.sln` in `node_modules/@builder.io/react-native/windows/RNReactNative.sln` folder to their solution, reference from their app.
2. Open up your `MainPage.cs` app
  - Add `using React.Native.RNReactNative;` to the usings at the top of the file
  - Add `new RNReactNativePackage()` to the `List<IReactPackage>` returned by the `Packages` method


## Usage
```javascript
import RNReactNative from '@builder.io/react-native';

// TODO: What to do with the module?
RNReactNative;
```
