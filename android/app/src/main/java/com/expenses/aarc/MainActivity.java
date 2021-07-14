package com.expenses.aarc;
import android.os.Bundle;
import com.byteowls.capacitor.oauth2.OAuth2ClientPlugin;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;
public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here. Use a import or the full qualified class name of the plugin (FQCN).
      add(com.byteowls.capacitor.oauth2.OAuth2ClientPlugin.class);
      // NOTE: The FQCN is redundant but it is clearer especially if someone is not familiar with Android/Java programming.
    }});
  }
}
