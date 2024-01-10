package com.example.myapplication

import androidx.compose.ui.graphics.Color
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import java.net.URL

fun getContent(modelName: String, apiKey: String, url: String, onDone: (BuilderContent) -> Unit) {
    val url = "https://cdn.builder.io/api/v3/content/$modelName?url=$url&apiKey=$apiKey&single=true"
    GlobalScope.launch {
        val responseString = URL(url).readText()
        val obj = Json {
            ignoreUnknownKeys = true
        }.decodeFromString<BuilderContent>(responseString)
        onDone(obj)
    }
}

fun getStyleInt(block: BuilderBlock, property: String): Int {
    val value = getStyle(block, property)
    if (value != null) {
        var int = value
            .replace("\\D+".toRegex(), "")
            .toInt();
        return int
    }

    return 0
}

fun getStyleColor(block: BuilderBlock, property: String, default: Color): Color {
    // TODO: support hex too
    val value = getStyle(block, property) ?: return default

    val regex = """rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)""".toRegex()
    val matchResult = regex.find(value) ?: return default
    val (r, g, b, a) = matchResult.destructured

    return Color(r.toInt(), g.toInt(), b.toInt(), a.toInt() * 255)
}

fun getStyle(block: BuilderBlock, property: String): String? {
    val smallValue = block.responsiveStyles?.small?.get(property)
    if (smallValue != null) {
        return smallValue
    }

    val mediumValue = block.responsiveStyles?.medium?.get(property)
    if (mediumValue != null) {
        return mediumValue
    }

    val largeValue = block.responsiveStyles?.large?.get(property)
    if (largeValue != null) {
        return largeValue
    }

    return null
}
