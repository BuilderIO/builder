package com.example.myapplication.blocks

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.myapplication.BuilderBlock
import com.example.myapplication.RenderBlock
import kotlinx.serialization.Serializable

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