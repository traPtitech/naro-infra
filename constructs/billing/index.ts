import {
  billingBudget,
  cloudfunctions2Function,
  dataGoogleProject,
  project,
  projectIamMember,
  projectService,
  pubsubTopic,
  serviceAccount,
  storageBucket,
  storageBucketObject,
} from "@cdktf/provider-google";
import { AssetType, ITerraformDependable, TerraformAsset } from "cdktf";
import { Construct } from "constructs";

const requiredServices = [
  "cloudfunctions.googleapis.com",
  "billingbudgets.googleapis.com",
  "cloudbilling.googleapis.com",
  "iam.googleapis.com",
  "compute.googleapis.com",
  "eventarc.googleapis.com",
  "run.googleapis.com",
  "cloudbuild.googleapis.com",
];
export class BillingManager extends Construct {
  constructor(
    scope: Construct,
    id: string,
    billingProject: dataGoogleProject.DataGoogleProject,
    billingAccountId: string,
    limit: number,
    projects: project.Project[]
  ) {
    super(scope, id);

    let cfDependencies: ITerraformDependable[] = [];
    requiredServices.forEach((v, i) => {
      const service = new projectService.ProjectService(this, "service-" + i, {
        project: billingProject.number,
        service: v,
        disableOnDestroy: true,
      });
      cfDependencies.push(service);
    });

    const archive = new TerraformAsset(this, "src-archive", {
      path: "functions/billing",
      type: AssetType.ARCHIVE,
    });

    const bucket = new storageBucket.StorageBucket(this, "bucket", {
      project: billingProject.number,
      name: "billing-function",
      location: "ASIA-NORTHEAST1",
      uniformBucketLevelAccess: true,
    });

    const source = new storageBucketObject.StorageBucketObject(
      this,
      "bucket-object",
      {
        name: "billing",
        bucket: bucket.name,
        source: archive.path,
      }
    );

    const sa = new serviceAccount.ServiceAccount(this, "bf-sa", {
      accountId: "billing-sa",
      project: billingProject.id,
    });

    const roles = [
      "roles/run.invoker",
      "roles/eventarc.eventReceiver",
      "roles/artifactregistry.reader",
    ];

    roles.forEach((v, i) => {
      const iam = new projectIamMember.ProjectIamMember(
        this,
        "bf-sa-member-" + i,
        {
          project: billingProject.id,
          role: v,
          member: `serviceAccount:${sa.email}`,
        }
      );
      cfDependencies.push(iam);
    });

    projects.forEach((v, i) => {
      const topic = new pubsubTopic.PubsubTopic(this, "billing-pubsub-" + i, {
        project: billingProject.number,
        name: "billing-pubsub-" + v.number,
      });
      new cloudfunctions2Function.Cloudfunctions2Function(this, "bf-" + i, {
        dependsOn: cfDependencies,
        project: billingProject.number,
        name: v.projectId,
        location: "asia-northeast1",
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
        },
      });
      new billingBudget.BillingBudget(this, "budget", {
        dependsOn: cfDependencies,
        billingAccount: billingAccountId,
        amount: {
          specifiedAmount: {
            currencyCode: "JPY",
            units: limit.toString(),
          },
        },
        budgetFilter: {
          projects: [`projects/${v.number}`],
        },
        allUpdatesRule: {
          pubsubTopic: topic.id,
        },
      });
    });
  }
}
