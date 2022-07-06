package com.example.myapplication

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class BuilderContent(val name: String? = null, val data: BuilderData? = null)

@Serializable
data class BuilderBlock(
    val id: String? = null,
    val children: ArrayList<BuilderBlock>? = null,
    val component: BuilderBlockComponent? = null,
    var responsiveStyles: BuilderBlockResponsiveStyles? = null
)

typealias BuilderBlockStyles = Map<String, String?>

@Serializable
data class BuilderBlockResponsiveStyles(
    val large: BuilderBlockStyles? = null,
    val medium: BuilderBlockStyles? = null,
    val small: BuilderBlockStyles? = null
)

@Serializable
data class BuilderBlockComponent(
    val name: String = "",
    val options: Map<String, JsonElement?>? = null
)

@Serializable
data class BuilderData(val blocks: ArrayList<BuilderBlock>? = null)