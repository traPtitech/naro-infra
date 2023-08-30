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

export interface BillingTopic {
  project: project.Project;
  topicId: string;
}

export class BillingManagerStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    billingAccountId: string,
    limit: number,
    topics: BillingTopic[]
  ) {
    super(scope, id);

    const archive = new TerraformAsset(this, "src-archive", {
      path: "functions/billing",
      type: AssetType.ARCHIVE,
    });

    const bucket = new storageBucket.StorageBucket(scope, "bucket", {
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

    topics.forEach((v) => {
      new cloudfunctions2Function.Cloudfunctions2Function(
        scope,
        "bf-" + v.project.number,
        {
          name: v.project.number,
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
              GCP_PROJECT_ID: v.project.id,
            },
          },
          eventTrigger: {
            eventType: "google.cloud.pubsub.topic.v1.messagePublished",
            pubsubTopic: v.topicId,
            serviceAccountEmail: billingSA.email,
          },
        }
      );
      const topic = new pubsubTopic.PubsubTopic(
        this,
        "billing-pubsub-" + v.project.number,
        {
          name: "billing-pubsub-" + v.project.number,
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
          projects: [v.project.id],
        },
        allUpdatesRule: {
          pubsubTopic: topic.id,
        },
      });
    });
    // Billing alert cloud pub/sub
  }
}
