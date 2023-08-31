import { project, projectIamMember } from "@cdktf/provider-google";
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

export class ParticipantProject extends Construct {
  public proj: project.Project;
  constructor(scope: Construct, id: string, config: ProjectConfig) {
    super(scope, id);
    this.proj = new project.Project(
      this,
      config.prefix + config.participant.id,
      {
        name: config.prefix + config.participant.id,
        projectId:
          config.prefix +
          config.participant.id +
          "-" +
          Math.floor(new Date().getTime() / 1000).toString(),
        folderId: config.folderId,
        billingAccount: config.billingAccount,
      }
    );

    new projectIamMember.ProjectIamMember(this, "participant-editor", {
      project: this.proj.id,
      role: "roles/editor",
      member: `user:${config.participant.gmail}`,
    });
    config.admins.forEach((v) => {
      new projectIamMember.ProjectIamMember(this, "admin-" + v.id, {
        project: this.proj.id,
        role: "roles/admin",
        member: `user:${v.gmail}`,
      });
    });
  }
}
