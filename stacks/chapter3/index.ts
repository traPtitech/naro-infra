import { Construct } from "constructs";
import { TerraformStack } from "cdktf";
import {
  GoogleProvider,
  GoogleProviderConfig,
} from "@cdktf/provider-google/lib/provider";
import { Folder } from "@cdktf/provider-google/lib/folder";

interface Chapter3Config {
  google: GoogleProviderConfig;
  organizationId?: string;
}

class Chapter3Stack extends TerraformStack {
  constructor(scope: Construct, id: string, config: Chapter3Config) {
    super(scope, id);

    new GoogleProvider(this, "google", config.google);

    const folder = new Folder(this, "chapter3", {
      displayName: "naro-chapter3",
      parent: "organizations/" + (config.organizationId || "0"),
    });

    // define resources here
  }
}
