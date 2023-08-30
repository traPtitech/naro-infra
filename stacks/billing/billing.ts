import {
  billingAccountIamMember,
  billingBudget,
  cloudfunctions2Function,
  project,
  pubsubTopic,
  serviceAccount,
  storageBucket,
  storageBucketObject,
} from "@cdktf/provider-google";
import { AssetType, TerraformAsset, TerraformStack } from "cdktf";
import { Construct } from "constructs";
export class BillingManagerStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    billingProjectId: string,
    billingAccountId: string,
    limit: number,
    projects: project.Project[]
  ) {
    super(scope, id);

    const archive = new TerraformAsset(this, "src-archive", {
      path: "functions/billing",
      type: AssetType.ARCHIVE,
    });

    const bucket = new storageBucket.StorageBucket(scope, "bucket", {
      project: billingProjectId,
      name: "billing-function",
      location: "ASIA-NORTHEAST1",
    });

    const source = new storageBucketObject.StorageBucketObject(
      scope,
      "bucket-object",
      {
        name: "billing",
        bucket: bucket.name,
        source: archive.path,
      }
    );

    const billingSA = new serviceAccount.ServiceAccount(
      this,
      "service-account",
      {
        project: billingProjectId,
        accountId: "billing-sa",
      }
    );

    new billingAccountIamMember.BillingAccountIamMember(
      this,
      "billing-delete",
      {
        billingAccountId: billingAccountId,
        role: "roles/billing.admin",
        member: "serviceAccount:" + billingSA.email,
      }
    );

    projects.forEach((v) => {
      const topic = new pubsubTopic.PubsubTopic(
        this,
        "billing-pubsub-" + v.number,
        {
          project: billingProjectId,
          name: "billing-pubsub-" + v.number,
        }
      );
      new cloudfunctions2Function.Cloudfunctions2Function(
        scope,
        "bf-" + v.number,
        {
          project: billingProjectId,
          name: v.number,
          buildConfig: {
            runtime: "python311",
            source: {
              storageSource: {
                bucket: bucket.name,
                object: source.name,
              },
            },
            entryPoint: "stop_billing",
            environmentVariables: {
              GCP_PROJECT_ID: v.id,
            },
          },
          eventTrigger: {
            eventType: "google.cloud.pubsub.topic.v1.messagePublished",
            pubsubTopic: topic.id,
            serviceAccountEmail: billingSA.email,
          },
        }
      );
      new billingBudget.BillingBudget(this, "budget", {
        billingAccount: billingAccountId,
        amount: {
          specifiedAmount: {
            currencyCode: "JPY",
            units: limit.toString(),
          },
        },
        budgetFilter: {
          projects: [v.id],
        },
        allUpdatesRule: {
          pubsubTopic: topic.id,
        },
      });
    });
  }
}
