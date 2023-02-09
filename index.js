const core = require("@actions/core");
let fs = require("fs");

const tag = core.getInput("Tag");
const file = core.getInput("ScriptFileName");
const dockerfile = core.getInput("DockerfileName");
const buildArgs = core.getInput("ParamsEnv");
const secretBuildArgs = process.env.BUILD_ARGS;

const main = () => {
  const allBuildArgs = `${buildArgs}\n${secretBuildArgs}`;
  const buildArgsObj = generateParametersObject(allBuildArgs);
  const scriptString = generateBuildScript(buildArgsObj, tag, dockerfile);
  if (file) writeFile(file, scriptString);
  core.setOutput("script", scriptString);
};

const generateParametersObject = (buildArgsStr) => {
  const paramLines = buildArgsStr.split(/\r?\n/);
  const paramsObject = paramLines
    .filter((line) => line.includes("="))
    .reduce((prev, line) => {
      let [name, value] = line
        .split("=")
        .map((s) => s.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, ""));
      return { ...prev, [name]: value };
    }, {});
  return paramsObject;
};

const generateBuildScript = (buildArgsObj, buildTag, dockerfile) => {
  const buildargs = Object.keys(buildArgsObj)
    .map((key) => {
      value = buildArgsObj[key];
      return `--build-arg ${key}=${value}`;
    })
    .join(" ");
  const script = `docker build -t ${buildTag} -f ${dockerfile} ${buildargs} .`;
  return script;
};

const writeFile = (filename, strContent) => {
  fs.writeFile(filename, strContent, function (err) {
    if (err) throw err;
  });
};

main();
