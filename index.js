const core = require("@actions/core");
let fs = require("fs");

const tag = core.getInput("Tag");
const file = core.getInput("ScriptFileName");
const dockerfile = core.getInput("DockerfileName");
const params = core.getInput("ParamsEnv");

const main = () => {
  const paramsObj = generateParametersObject(params);
  const scriptString = generateBuildScript(paramsObj, tag, dockerfile);
  writeFile(file, scriptString);
  core.setOutput("script", scriptString);
};

const generateParametersObject = (paramsStr) => {
  const paramLines = paramsStr.split(/\r?\n/);
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

const generateBuildScript = (paramsObj, buildTag, dockerfile) => {
  const buildargs = Object.keys(paramsObj)
    .map((key) => {
      value = paramsObj[key];
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
