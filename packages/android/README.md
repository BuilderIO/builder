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

    LaunchedEffect(Unit, block = {
        // Fetch content JSON from Builder.io API
        getContent(modelName, apiKey, url) { received ->
            content = received
        }

        // Register your custom components
        registerCustomComponents()
    })

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
    val componentOptions = ComponentOptions(
        name = "OurButton",
        inputs = arrayListOf(
            ComponentInput(
                name = "text",
                type = "text",
                defaultValue = "Hello!"
            )
        )
    )
    
    // Register custom component
    registerComponent(componentOptions) @Composable { options, _ ->
        var text = options?.get("text")?.jsonPrimitive?.contentOrNull ?: ""
        MyButton(text)
    }
}
```

## Interoperability

You don't need to use Jetpack Compose to use this SDK, you can learn about interoperability with Android Views [here](https://developer.android.com/jetpack/compose/interop/interop-apis)

## TODO
- Make final installable package
- Stress test the renderer against a larger variety of Builder content and ensure it renders as expected
