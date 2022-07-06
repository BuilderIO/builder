package com.example.myapplication.blocks

import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import coil.compose.AsyncImage
import com.example.myapplication.BuilderBlock
import com.example.myapplication.ComponentOptions
import com.example.myapplication._registerComponent
import com.example.myapplication.registerComponent
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive

@Composable
fun BuilderImage(block: BuilderBlock, image: String, aspectRatio: Float?) {
    var mod = Modifier.fillMaxWidth()
    if (aspectRatio != null) {
        mod = mod.aspectRatio(aspectRatio)
    }
    AsyncImage(
        model = image,
        contentDescription = null,
        modifier = mod
    )
}

fun registerImage() {
    _registerComponent(
        ComponentOptions(name = "Image")
    ) @Composable { options, block ->
        val image = options["image"]?.jsonPrimitive?.contentOrNull
        val aspectRatio =
            options["aspectRatio"]?.jsonPrimitive?.contentOrNull
        if (image is String) {
            BuilderImage(
                block, image, if (aspectRatio == null) {
                    null
                } else {
                    1 / aspectRatio.toFloat()
                }
            )
        }
    }
}

