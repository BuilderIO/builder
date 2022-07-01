package com.example.myapplication.blocks

import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import coil.compose.AsyncImage
import com.example.myapplication.BuilderBlock

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