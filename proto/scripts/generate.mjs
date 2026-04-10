#!/usr/bin/env node
import { existsSync, mkdirSync, rmSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative, dirname } from "node:path";
import { spawnSync } from "node:child_process";

const scriptDir = new URL(".", import.meta.url).pathname.replace(
    /^\/([A-Z]:\/)/,
    "$1",
);
const protoRootDir = resolve(scriptDir, "..");
const srcDir = resolve(protoRootDir, "src");
const tsOutDir = resolve(protoRootDir, "gen", "ts");
const goOutDir = resolve(protoRootDir, "gen", "go");

const target = process.argv[2] ?? "all";

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

const getAllProtoFiles = (dir, fileList = []) => {
    const files = readdirSync(dir);
    files.forEach((file) => {
        const filePath = join(dir, file);
        if (statSync(filePath).isDirectory()) {
            getAllProtoFiles(filePath, fileList);
        } else if (file.endsWith(".proto")) {
            fileList.push(filePath);
        }
    });
    return fileList;
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
    if (!existsSync(srcDir)) return;
    mkdirSync(tsOutDir, { recursive: true });

    const protoFiles = getAllProtoFiles(srcDir);

    protoFiles.forEach((protoFile) => {
        const relPath = relative(srcDir, protoFile);
        const fileName = relPath.replace(/\.proto$/, "");
        const outJs = resolve(tsOutDir, `${fileName}.js`);
        const outTs = resolve(tsOutDir, `${fileName}.d.ts`);

        mkdirSync(dirname(outJs), { recursive: true });

        console.log(`Generating TS for ${relPath}...`);

        run("pnpm", [
            "exec",
            "pbjs",
            "-t",
            "static-module",
            "-w",
            "commonjs",
            "-o",
            outJs,
            protoFile,
        ]);

        run("pnpm", ["exec", "pbts", "-o", outTs, outJs]);
    });
};

const generateGo = () => {
    if (!commandExists("protoc")) {
        console.error(
            "Error: protoc is required for Go generation. Install protoc and rerun generate:go.",
        );
        process.exit(1);
    }

    if (!existsSync(srcDir)) return;

    ensureGoPlugins();
    mkdirSync(goOutDir, { recursive: true });

    const gopathResult = spawnSync("go", ["env", "GOPATH"], {
        encoding: "utf8",
        shell: process.platform === "win32",
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

    const protoFiles = getAllProtoFiles(srcDir);

    protoFiles.forEach((protoFile) => {
        const relPath = relative(srcDir, protoFile);
        console.log(`Generating Go for ${relPath}...`);

        run(
            "protoc",
            [
                `--go_out=${goOutDir}`,
                "--go_opt=paths=source_relative",
                `--go-grpc_out=${goOutDir}`,
                "--go-grpc_opt=paths=source_relative",
                `-I${srcDir}`,
                protoFile,
            ],
            { env },
        );
    });
};

const clean = () => {
    for (const path of [resolve(protoRootDir, "gen")]) {
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
