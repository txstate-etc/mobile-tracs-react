package edu.txstate.mobile.tracs;

import android.app.AlertDialog;
import android.content.Context;

class Alert extends AlertDialog.Builder {
    Alert(Context context, String title, String message) {
        super(context);
        super.setTitle(title);
        super.setMessage(message);
    }
}

