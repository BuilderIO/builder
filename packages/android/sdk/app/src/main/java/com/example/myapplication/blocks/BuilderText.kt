package com.example.myapplication.blocks

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import com.example.myapplication.*
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive

@Composable
fun BuilderText(block: BuilderBlock, text: String) {
    // Strip HTML out
    val stripped = text.replace(
        "<.*?>".toRegex(),
        ""
    )
    val textAlign = getStyle(block, "textAlign")
    Text(
        stripped,
        color = getStyleColor(block, "color", Color.Black),
        textAlign = when (textAlign) {
            "center" -> TextAlign.Center
            "right" -> {
                TextAlign.Right
            }
            else -> {
                TextAlign.Left
            }
        },
        modifier = Modifier.fillMaxWidth()
    )
}


fun registerText() {
    _registerComponent(
        ComponentOptions(name = "Text")
    ) @Composable { options, block ->
        val text = options?.get("text")?.jsonPrimitive?.contentOrNull
        if (text is String) {
            BuilderText(block, text)
        }
    }
}
