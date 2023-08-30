import { project, projectIamMember, pubsubTopic } from "@cdktf/provider-google";
import { TerraformStack } from "cdktf";
import { Construct } from "constructs";

export interface User {
  id: string;
  gmail: string;
}
export interface ProjectConfig {
  prefix: string;
  admins: User[];
  participant: User;
  folderId: string;
  billingAccount: string;
}

export class ProjectStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: ProjectConfig) {
    super(scope, id);

    const participantProject = new project.Project(
      this,
      config.prefix + config.participant.id,
      {
        name: config.participant.id,
        projectId:
          config.prefix +
          config.participant +
          "-" +
          Math.floor(new Date().getTime() / 1000).toString(),
        folderId: config.folderId,
        billingAccount: config.billingAccount,
      }
    );

    new projectIamMember.ProjectIamMember(this, "participant-editor", {
      project: participantProject.id,
      role: "roles/editor",
      member: `user:${config.participant.gmail}`,
    });

    config.admins.forEach((v) => {
      new projectIamMember.ProjectIamMember(this, "admin-" + v.id, {
        project: participantProject.id,
        role: "roles/admin",
        member: `user:${v.gmail}`,
      });
    });
  }
}
