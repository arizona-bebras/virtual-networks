#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const protoDir = resolve(scriptDir, "..");
const protoSrcDir = resolve(protoDir, "src");
const tsOutDir = resolve(protoDir, "gen", "ts");
const goOutDir = resolve(protoDir, "gen", "go");

const target = process.argv[2] ?? "all";

const toProtoPath = (path) => path.split(sep).join("/");

const collectProtoFiles = (directory, root = directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return collectProtoFiles(entryPath, root);
    }

    if (entry.isFile() && entry.name.endsWith(".proto")) {
      return [toProtoPath(relative(root, entryPath))];
    }

    return [];
  });

const getProtoFiles = () => {
  const files = collectProtoFiles(protoSrcDir).sort((left, right) =>
    left.localeCompare(right),
  );

  if (files.length === 0) {
    console.error("Error: no .proto files found in src/.");
    process.exit(1);
  }

  return files;
};

const recreateDir = (path) => {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
  mkdirSync(path, { recursive: true });
};

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const commandExists = (command) => {
  const checker = process.platform === "win32" ? "where" : "command";
  const checkerArgs =
    process.platform === "win32" ? [command] : ["-v", command];
  const result = spawnSync(checker, checkerArgs, {
    stdio: "ignore",
    shell: process.platform !== "win32",
  });

  return result.status === 0;
};

const ensureGoPlugins = () => {
  if (!commandExists("protoc-gen-go")) {
    console.log("Installing protoc-gen-go...");
    run("go", [
      "install",
      "google.golang.org/protobuf/cmd/protoc-gen-go@v1.36.6",
    ]);
  }

  if (!commandExists("protoc-gen-go-grpc")) {
    console.log("Installing protoc-gen-go-grpc...");
    run("go", [
      "install",
      "google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.5.1",
    ]);
  }
};

const generateTs = () => {
  recreateDir(tsOutDir);
  const protoFiles = getProtoFiles();

  run(
    "protoc",
    [
      "--proto_path=src",
      process.platform === "win32"
        ? '--plugin=protoc-gen-ts_proto=".\\node_modules\\.bin\\protoc-gen-ts_proto.cmd"'
        : "--plugin=./node_modules/.bin/protoc-gen-ts_proto",
      "--ts_proto_opt=nestJs=true",
      "--ts_proto_opt=addGrpcMetadata=true",
      "--ts_proto_opt=esModuleInterop=true",
      "--ts_proto_out=gen/ts",
      ...protoFiles,
    ],
    { cwd: protoDir },
  );
};

const generateGo = () => {
  if (!commandExists("protoc")) {
    console.error(
      "Error: protoc is required for Go generation. Install protoc and rerun generate:go.",
    );
    process.exit(1);
  }

  ensureGoPlugins();
  recreateDir(goOutDir);
  const protoFiles = getProtoFiles();

  const gopathResult = spawnSync("go", ["env", "GOPATH"], {
    encoding: "utf8",
    shell: process.platform === "win32",
    cwd: protoDir,
  });

  if (gopathResult.status !== 0) {
    process.exit(gopathResult.status ?? 1);
  }

  const gopath = gopathResult.stdout.trim();
  const pathSeparator = process.platform === "win32" ? ";" : ":";
  const env = {
    ...process.env,
    PATH: `${resolve(gopath, "bin")}${pathSeparator}${process.env.PATH ?? ""}`,
  };

  run(
    "protoc",
    [
      "--go_out=.",
      "--go_opt=module=proto",
      "--go-grpc_out=.",
      "--go-grpc_opt=module=proto",
      "-Isrc",
      ...protoFiles,
    ],
    { cwd: protoDir, env },
  );
};

const clean = () => {
  for (const path of [resolve(protoDir, "gen"), resolve(protoDir, "dist")]) {
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true });
    }
  }
};

switch (target) {
  case "ts":
    generateTs();
    break;
  case "go":
    generateGo();
    break;
  case "all":
    generateTs();
    generateGo();
    break;
  case "clean":
    clean();
    break;
  default:
    console.error(`Unknown target '${target}'. Use ts, go, all, or clean.`);
    process.exit(1);
}
