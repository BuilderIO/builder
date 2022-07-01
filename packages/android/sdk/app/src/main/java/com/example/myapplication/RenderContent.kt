package com.example.myapplication

import android.content.ContentValues.TAG
import android.util.Log
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.*
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.firestore.ktx.toObject
import com.google.firebase.ktx.Firebase

val db = Firebase.firestore
var isEditing = false

@Composable
fun RenderContent(content: BuilderContent) {
    var content by remember { mutableStateOf<BuilderContent?>(content) }

    val collectionName = "components"
    val docId = "00df1822dbdf48d18a1fdef36d98a315"

    if (isEditing) {
        val docRef = db.collection(collectionName).document(docId)
        docRef.addSnapshotListener { snapshot, e ->
            if (e != null) {
                Log.w(TAG, "Listen failed.", e)
                return@addSnapshotListener
            }

            if (snapshot != null && snapshot.exists()) {
                Log.d(TAG, "Current data: ${snapshot.data}")
                // TODO: fix serialization
                // content = snapshot.toObject<BuilderContent>()
            } else {
                Log.d(TAG, "Current data: null")
            }
        }

    }


    Column {
        content?.data?.blocks?.forEach { block ->
            RenderBlock(block)
        }
    }
}