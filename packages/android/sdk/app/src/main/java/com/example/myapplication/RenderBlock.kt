package com.example.myapplication

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.unit.dp
import kotlinx.serialization.json.JsonElement

val docRef = db.collection(collectionName).document(docId)

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
            .onGloballyPositioned { layoutCoordinates ->
                if (isEditing) {
                    val bounds = layoutCoordinates.boundsInWindow()
                    val blockId = block.id
                    docRef.update("blocks.$blockId.top", bounds.top)
                    docRef.update("blocks.$blockId.left", bounds.left)
                    docRef.update("blocks.$blockId.width", bounds.width)
                    docRef.update("blocks.$blockId.height", bounds.height)
                }
            }
    ) {
        val name = block.component?.name

        if (name != null) {
            val factory = components.get(name)
            if (factory != null) {
                factory(block.component.options as Map<String, JsonElement>, block)
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

typealias ComponentFactory =  @Composable (Map<String, JsonElement>, BuilderBlock) -> Unit
val components = mutableMapOf<String, ComponentFactory>()

fun registerComponent(options: ComponentOptions, component: ComponentFactory) {
    components[options.name] = component
}

data class ComponentOptions(val name: String, val inputs: ArrayList<ComponentInput>? = null)

data class ComponentInput(
    val type: String,
    val name: String
)