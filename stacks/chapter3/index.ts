import { Construct } from "constructs";
import { CloudBackend, GcsBackend, TerraformStack } from "cdktf";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { Folder } from "@cdktf/provider-google/lib/folder";
import { ProjectStack, User } from "../../modules/project";
import { readFileSync } from "fs";
import { load } from "js-yaml";

export interface Chapter3Config {
  google: {
    project: string;
    region: string;
    bucket: string;
  };
  organizationId?: string;
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

    new GoogleProvider(this, "google", {
      project: config.google.project,
      region: config.google.region,
    });
    const configfile = load(readFileSync("config.yaml", "utf8")) as Config;
    const folder = new Folder(this, "chapter3", {
      displayName: "naro-chapter3",
      parent: "organizations/" + (config.organizationId || "0"),
    });

    configfile.participants.forEach((v) => {
      new ProjectStack(this, "naro-chapter3-" + v.id, {
        prefix: "naro-chapter3-",
        admins: configfile.admins,
        participant: v,
        folderId: folder.id,
        billingAccount: configfile.billingAccount,
      });
    });

    // define resources here
  }
}
