import { Construct } from "constructs";
import { GcsBackend, TerraformStack } from "cdktf";
import { ParticipantProject, User } from "../../constructs/project";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import { project, provider } from "@cdktf/provider-google";

export interface Chapter3Config {
  google: {
    project: string;
    region: string;
    bucket: string;
  };
}

interface Config {
  admins: User[];
  participants: User[];
  billingAccount: string;
}
export class Chapter3Stack extends TerraformStack {
  constructor(scope: Construct, id: string, config: Chapter3Config) {
    super(scope, id);

    new GcsBackend(this, {
      bucket: config.google.bucket,
    });

    new provider.GoogleProvider(this, "google", {
      project: config.google.project,
      region: config.google.region,
      billingProject: config.google.project,
      userProjectOverride: true,
    });

    // const billingProject = new dataGoogleProject.DataGoogleProject(
    //   this,
    //   "this",
    //   {}
    // );
    const configfile = load(readFileSync("config.yaml", "utf8")) as Config;

    let projects: project.Project[] = [];

    configfile.participants.forEach((v) => {
      const proj = new ParticipantProject(this, "naro-chapter3-" + v.id, {
        prefix: "naro-chapter3-",
        admins: configfile.admins,
        participant: v,
        billingAccount: configfile.billingAccount,
      });
      projects.push(proj.proj);
    });

    // new BillingManager(
    //   this,
    //   "billing-manager",
    //   billingProject,
    //   configfile.billingAccount,
    //   3000,
    //   projects
    // );
  }
}
