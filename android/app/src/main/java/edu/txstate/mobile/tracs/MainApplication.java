package edu.txstate.mobile.tracs;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.aakashns.reactnativedialogs.ReactNativeDialogsPackage;
import com.remobile.toast.RCTToastPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.oblador.keychain.KeychainPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.psykar.cookiemanager.CookieManagerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import edu.txstate.applaunch.AppLaunchPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;

import java.util.Arrays;
import java.util.List;

import edu.txstate.lockstatus.LockStatusPackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new ReactNativeDialogsPackage(),
          new RCTToastPackage(),
          new VectorIconsPackage(),
          new KeychainPackage(),
          new FIRMessagingPackage(),
          new RNFirebasePackage(),
          new RNFirebaseAnalyticsPackage(),
          new LockStatusPackage(),
          new AppLaunchPackage(),
          new CookieManagerPackage(),
          new TRACSWebPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index.android";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
