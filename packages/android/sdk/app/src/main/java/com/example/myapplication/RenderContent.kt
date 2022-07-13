package com.example.myapplication

import android.app.Activity
import android.content.ContentValues.TAG
import android.content.Context
import android.content.ContextWrapper
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Rect
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.util.Log
import android.view.PixelCopy
import android.view.View
import android.view.Window
import android.view.WindowManager
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.lifecycle.findViewTreeLifecycleOwner
import androidx.lifecycle.lifecycleScope
import com.example.myapplication.blocks.registerColumns
import com.example.myapplication.blocks.registerImage
import com.example.myapplication.blocks.registerText
import com.google.firebase.firestore.SetOptions
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import java.io.ByteArrayOutputStream


val db = Firebase.firestore

// TODO: move out of here
var isEditing: Boolean = true
const val collectionName = "components"
const val docId = "00df1822dbdf48d18a1fdef36d98a315"

@Composable
fun RenderContent(content: BuilderContent) {
    var content by remember { mutableStateOf<BuilderContent?>(content) }

    val view = LocalView.current
    val context = LocalContext.current
    val lifecycleOwner = view.findViewTreeLifecycleOwner()

    LaunchedEffect(Unit, block = {
        registerComponents()
    })

    KeepScreenOn()

    if (isEditing) {
        DisposableEffect(LocalLifecycleOwner.current) {
            Log.d(TAG, "Init ran")
            val docRef = db.collection(collectionName).document(docId)
            val metaDocRef = db.collection(collectionName).document("$docId:meta")

            val takeScreenshot: (Unit) -> Unit = debounce(
                200L,
                lifecycleOwner!!.lifecycleScope,
            ) {
                val window = (context as Activity).window
                Log.d(TAG, "Init screenshot")
                captureView(view, window) { screenshot ->
                    // Convert bitmap to WEBP byteArray
                    val byteArrayOutputStream = ByteArrayOutputStream()
                    screenshot.compress(Bitmap.CompressFormat.WEBP, 60, byteArrayOutputStream)
                    val byteArray: ByteArray = byteArrayOutputStream.toByteArray()

                    val encoded = Base64.encodeToString(byteArray, Base64.DEFAULT)

                    val data = hashMapOf(
                        "screenshot" to encoded,
                        "screenshotHeight" to dpToPixel(view.height.dp),
                        "screenshotWidth" to dpToPixel(view.width.dp)
                    )
                    Log.d(TAG, "Send screenshot")
                    metaDocRef.set(data, SetOptions.merge())
                }
            }

            val ref = docRef.addSnapshotListener { snapshot, e ->
                if (e != null) {
                    Log.w(TAG, "Listen failed.", e)
                    return@addSnapshotListener
                }

                if (snapshot != null && snapshot.exists()) {
                    Log.d(TAG, "Got data")
                    val gson = Gson();

                    val now = System.currentTimeMillis()
                    val json = gson.toJson(snapshot.data)
                    val obj = Json {
                        ignoreUnknownKeys = true
                    }.decodeFromString<BuilderContent>(json)
                    content = obj
                    takeScreenshot(Unit)
                    val timeDelta = System.currentTimeMillis() - now
                    Log.d(TAG, "Update took $timeDelta ms")
                } else {
                    Log.d(TAG, "Current data: null")
                }
            }
            onDispose {
                ref.remove()
            }
        }
    }

    Column {
        content?.data?.blocks?.forEach { block ->
            RenderBlock(block)
        }
    }
}

fun <T> debounce(
    waitMs: Long = 300L,
    coroutineScope: CoroutineScope,
    destinationFunction: (T) -> Unit
): (T) -> Unit {
    var debounceJob: Job? = null
    return { param: T ->
        debounceJob?.cancel()
        debounceJob = coroutineScope.launch {
            delay(waitMs)
            destinationFunction(param)
        }
    }
}


fun captureView(view: View, window: Window, bitmapCallback: (Bitmap) -> Unit) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        // Above Android O, use PixelCopy
        val bitmap = Bitmap.createBitmap(view.width, view.height, Bitmap.Config.ARGB_8888)
        val location = IntArray(2)
        view.getLocationInWindow(location)
        PixelCopy.request(
            window,
            Rect(location[0], location[1], location[0] + view.width, location[1] + view.height),
            bitmap,
            {
                if (it == PixelCopy.SUCCESS) {
                    bitmapCallback.invoke(bitmap)
                }
            },
            Handler(Looper.getMainLooper())
        )
    } else {
        val tBitmap = Bitmap.createBitmap(
            view.width, view.height, Bitmap.Config.RGB_565
        )
        val canvas = Canvas(tBitmap)
        view.draw(canvas)
        canvas.setBitmap(null)
        bitmapCallback.invoke(tBitmap)
    }
}

@Composable
fun KeepScreenOn() {
    val context = LocalContext.current

    DisposableEffect(LocalLifecycleOwner.current) {
        val window = context.findActivity()?.window
        window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        onDispose {
            window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        }
    }
}

fun Context.findActivity(): Activity? {
    var context = this
    while (context is ContextWrapper) {
        if (context is Activity) return context
        context = context.baseContext
    }
    return null
}

// TODO: find a cleaner way
fun registerComponents() {
    registerImage()
    registerColumns()
    registerText()
}