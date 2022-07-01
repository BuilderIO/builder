package com.example.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.Column
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.myapplication.ui.theme.MyApplicationTheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import java.net.URL
import kotlinx.serialization.*
import kotlinx.serialization.json.*

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
                    Greeting("Android")
                }
            }
        }
    }
}

val modelName = "page"
val apiKey = "7ff1b55f7ecb4f08a012fbb2a859aced"
val url = "/"

@Composable
fun Greeting(defaultName: String) {
    var name by remember { mutableStateOf(defaultName) }
    Column {
        Text(text = "Hello $name!")
        Button(onClick = {
            name = "Steve"
            val content = getContent(modelName, apiKey, url)
            name = content.name
        }) {
            Text("Click")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    MyApplicationTheme {
        Greeting("Android")
    }
}

fun getContent(modelName: String, apiKey: String, url: String): BuilderContent {
    val responseString = URL("https://cdn.builder.io/api/v2/content/$modelName?url=$url&apiKey=$apiKey&single=true").readText()
    val obj = Json.decodeFromString<BuilderContent>(responseString)
    return obj;
}

@Serializable
data class BuilderContent(val name: String)
