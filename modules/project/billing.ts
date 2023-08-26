import { AssetType, TerraformAsset, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { StorageBucket } from "@cdktf/provider-google/lib/storage-bucket";
import { StorageBucketObject } from "@cdktf/provider-google/lib/storage-bucket-object";
import { Cloudfunctions2Function } from "@cdktf/provider-google/lib/cloudfunctions2-function";

export class BillingManagerStack extends TerraformStack {
  constructor(scope: Construct, id: string, suffix: string, limit: number) {
    super(scope, id);

    const archive = new TerraformAsset(this, "billing-function-" + suffix, {
      path: "functions/billing",
      type: AssetType.ARCHIVE,
    });

    const bucket = new StorageBucket(scope, "billing-function-" + suffix, {
      name: "billing-function-" + suffix,
      location: "ASIA-NORTHEAST1",
    });

    const source = new StorageBucketObject(
      scope,
      "billing-function-" + suffix,
      {
        name: "billing",
        bucket: bucket.name,
        source: archive.path,
      }
    );

    const serviceAccount = ""

    const function = new Cloudfunctions2Function(scope, "billing-function-" + suffix, {
      name: "billing",
      buildConfig: {
        runtime: "python311",
        source: {
          storageSource: {
            bucket: bucket.name,
            object: source.name,
          },
        },
        entryPoint: "stop_billing",
      },
      eventTrigger: {
        serviceAccountEmail: serviceAccount
      }
    });
  }
}
