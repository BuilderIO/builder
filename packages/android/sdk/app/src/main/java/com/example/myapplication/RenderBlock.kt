package com.example.myapplication

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.myapplication.blocks.BuilderColumns
import com.example.myapplication.blocks.BuilderImage
import com.example.myapplication.blocks.BuilderText
import com.example.myapplication.blocks.Column
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive

@Composable
fun RenderBlock(block: BuilderBlock) {
    // TODO: only fillMaxWidth if should
    Box(
        Modifier
            .padding(
                getStyleInt(block, "marginLeft").dp,
                getStyleInt(block, "marginTop").dp,
                getStyleInt(block, "marginRight").dp,
                getStyleInt(block, "marginBottom").dp
            )
            .background(getStyleColor(block, "backgroundColor", Color.Transparent))
            .fillMaxWidth()
            .padding(
                getStyleInt(block, "paddingLeft").dp,
                getStyleInt(block, "paddingTop").dp,
                getStyleInt(block, "paddingRight").dp,
                getStyleInt(block, "paddingBottom").dp
            )
    ) {
        // TODO: component map and registerComponent()
        if (block.component?.name == "Text") {
            val text = block.component.options?.get("text")?.jsonPrimitive?.contentOrNull
            if (text is String) {
                BuilderText(block, text)
            }
        } else if (block.component?.name == "Columns") {
            val columnsString = block.component.options?.get("columns").toString()

            val columns = Json {
                ignoreUnknownKeys = true
            }.decodeFromString<ArrayList<Column>>(columnsString)
            BuilderColumns(
                block,
                columns,
                block.component.options?.get("space")?.jsonPrimitive?.contentOrNull?.toInt() ?: 0
            )
        } else if (block.component?.name == "Image") {
            val image = block.component.options?.get("image")?.jsonPrimitive?.contentOrNull
            val aspectRatio =
                block.component.options?.get("aspectRatio")?.jsonPrimitive?.contentOrNull
            if (image is String) {
                BuilderImage(
                    block, image, if (aspectRatio == null) {
                        null
                    } else {
                        1 / aspectRatio.toFloat()
                    }
                )
            }
        } else if (block.children != null) {
            Column {
                block.children.forEach { child ->
                    RenderBlock(child)
                }
            }
        }
    }
}
