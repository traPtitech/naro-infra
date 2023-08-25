import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { provider } from "@cdktf/provider-google";

interface Config {
  google?: provider.GoogleProviderConfig;
}

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: Config) {
    super(scope, id);

    new provider.GoogleProvider(this, "google", config.google);

    // define resources here
  }
}
const app = new App();
new MyStack(app, "chapter3", {});
app.synth();
