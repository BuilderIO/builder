package com.example.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.myapplication.ui.theme.MyApplicationTheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.unit.dp
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyApplicationTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colors.background
                ) {
                    Main()
                }
            }
        }
    }
}

const val modelName = "page"
const val apiKey = "7ff1b55f7ecb4f08a012fbb2a859aced"
const val url = "/"

@Composable
fun Main() {
    var content by remember { mutableStateOf<BuilderContent?>(null) }
    val scrollState = rememberScrollState()

    getContent(modelName, apiKey, url) { received ->
        content = received
    }

    registerCustomComponents()

    Column(
        Modifier
            .fillMaxHeight()
            .verticalScroll(scrollState)
    ) {
        if (content != null) {
            RenderContent(content!!)
        }
        TextButton(
            modifier = Modifier
                .padding(10.dp)
                .fillMaxWidth(),
            onClick = {
                getContent(modelName, apiKey, url) { received ->
                    content = received
                }
            }) {
            Text("Load")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    MyApplicationTheme {
        Main()
    }
}

@Composable
fun MyButton(text: String) {
    Button(
        onClick = {  }
    ) {
        Text(text)
    }
}

fun registerCustomComponents() {
    registerComponent(ComponentOptions(
        name = "OurButton",
        inputs = arrayListOf(
            ComponentInput(
                name = "text",
                type = "text",
                defaultValue = "Hello!"
            )
        )
    )) @Composable { options, _ ->
        var text = options?.get("text")?.jsonPrimitive?.contentOrNull ?: ""
        MyButton(text)
    }
}