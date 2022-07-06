package com.example.myapplication.blocks

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.myapplication.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive

@Composable
fun BuilderColumns(block: BuilderBlock, columns: ArrayList<Column>, gap: Int = 0) {
    Row(horizontalArrangement = Arrangement.spacedBy(gap.dp)) {
        columns.forEachIndexed { index, col ->
            Column(
                Modifier.weight(1f)
            ) {
                col.blocks.forEach { block ->
                    RenderBlock(block)
                }
            }
        }
    }
}

@Serializable
data class Column(val blocks: ArrayList<BuilderBlock>)

fun registerColumns() {
    _registerComponent(
        ComponentOptions(name = "Columns")
    ) @Composable { options, block ->
        val columnsString = options["columns"]?.toString()

        if (columnsString == null) {
            null
        }

        val columns = Json {
            ignoreUnknownKeys = true
        }.decodeFromString<ArrayList<Column>>(columnsString!!)
        BuilderColumns(
            block,
            columns,
            options["space"]?.jsonPrimitive?.contentOrNull?.toInt() ?: 0
        )
    }
}

