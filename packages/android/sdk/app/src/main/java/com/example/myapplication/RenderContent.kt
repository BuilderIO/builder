package com.example.myapplication

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable

@Composable
fun RenderContent(content: BuilderContent) {
    Column {
        content.data.blocks?.forEach { block ->
            RenderBlock(block)
        }
    }
}