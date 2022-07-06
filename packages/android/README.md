# Builder.io SDK for Android

Render Builder.io content to native Kotlin components. Uses [Jetpack Compose](https://jetpackcompose.com/)

## Developing

1. Install [Android Studio](https://developer.android.com/studio/install)
2. Open `./sdk` in Android Studio
3. [Build and run](https://developer.android.com/studio/run) from the Android Studio menus

## Usage

See [MainActivity.kt](./sdk/app/src/main/java/com/example/myapplication/MainActivity.kt) for a usage example

```kotlin
@Composable
fun Main() {
    var content by remember { mutableStateOf<BuilderContent?>(null) }

    // Fetch content
    getContent(modelName, apiKey, url) { received ->
        content = received
    }

    registerCustomComponents()

    if (content != null) {
      // Render content
      RenderContent(content!!)
    }
}

// Custom component
@Composable
fun MyButton(text: String) {
    Button(
        onClick = {  }
    ) {
        Text(text)
    }
}

fun registerCustomComponents() {
    // Register custom component
    registerComponent(ComponentOptions(
        name = "OurButton",
        inputs = arrayListOf(
            ComponentInput(
                name = "text",
                type = "text",
                defaultValue = "Hello!"
            )
        )
    )) @Composable { options, _ ->
        var text = options?.get("text")?.jsonPrimitive?.contentOrNull ?: ""
        MyButton(text)
    }
}
```

## TODO
- Make final installable package
- QR code based editing workflow (scan QR code in builder editor to connect your device and init editing)