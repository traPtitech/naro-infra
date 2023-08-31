import { App } from "cdktf";
import { Chapter3Stack } from "./stacks/chapter3";

const app = new App();
new Chapter3Stack(app, "chapter3", {
  google: {
    project: "naro-admin",
    region: "asia-northeast-1",
    bucket: "naro-terraform-tfstate",
  },
});
app.synth();
