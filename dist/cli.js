// src/cli.ts
import { execSync } from "child_process";
import { writeFile } from "fs/promises";
import { input } from "@inquirer/prompts";
import boxen from "boxen";
import chalk from "chalk";
import { program } from "commander";
import { config } from "dotenv";

// package.json
var package_default = {
  name: "usos-survey-filler",
  version: "1.1.0",
  description: "An automatic survey filler for WUST's USOS.",
  type: "module",
  scripts: {
    build: "tsup",
    start: "node dist/index.js"
  },
  bin: "./bin/index.js",
  files: [
    "dist"
  ],
  keywords: [],
  author: "Konrad Guzek",
  license: "AGPL-3.0-only",
  dependencies: {
    "@inquirer/prompts": "^7.3.2",
    boxen: "^8.0.1",
    chalk: "^5.4.1",
    commander: "^13.1.0",
    dotenv: "^16.4.7",
    puppeteer: "^24.3.0"
  },
  devDependencies: {
    "@ianvs/prettier-plugin-sort-imports": "^4.4.1",
    tsup: "^8.4.0",
    typescript: "^5.8.2"
  }
};

// src/cli.ts
var VERSION = package_default.version;
var cardIntro = boxen(
  chalk.white(`
  Witaj w USOS Survey Filler ${VERSION}!
  
  Tw\xF3rca: Konrad Guzek
  GitHub: https://github.com/kguzek
  Email: konrad@guzek.uk
`),
  {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "cyan",
    textAlignment: "center"
  }
);
var cardOutro = boxen(
  chalk.white(`
    Dzi\u0119kuj\u0119 za korzystanie z USOS Survey Filler.

  \u2B50 Zostaw mi gwiazdk\u0119 na GitHubie! \u2B50
  
  https://github.com/kguzek/usos-survey-filler
`),
  {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "yellow",
    textAlignment: "center"
  }
);
program.version(VERSION).description("USOS Survey Filler");
var print = (message) => console.log(
  `
${chalk.dim("[")}${chalk.bgCyan.white("USOS Survey Filler")}${chalk.reset.dim("]")} ${chalk.cyan(message)}
`
);
program.action(async () => {
  config();
  console.log(cardIntro);
  const username = process.env.USOS_USERNAME || await input({
    message: "\u{1F464} Nazwa u\u017Cytkownika do USOSa (opcjonalne):"
  });
  const password = process.env.USOS_PASSWORD || await input({
    message: "\u{1F511} Has\u0142o do USOSa (opcjonalne):"
  });
  if (password !== "" || username !== "") {
    const envContent = `USOS_USERNAME=${username}
USOS_PASSWORD=${password}`;
    await writeFile(".env", envContent);
  }
  config();
  print("Trwa instalacja programu...");
  execSync("npm install", { stdio: "inherit" });
  execSync("npx puppeteer browser install chrome", { stdio: "inherit" });
  print("Instalacja uko\u0144czona. Uruchamianie programu...");
  execSync("npm run start", { stdio: "inherit" });
  console.log(cardOutro);
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map