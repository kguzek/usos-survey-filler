// src/cli.ts
import { execSync } from "child_process";
import { writeFile } from "fs/promises";
import { input } from "@inquirer/prompts";
import boxen from "boxen";
import chalk from "chalk";
import { program } from "commander";
import { config } from "dotenv";
var VERSION = process.env.npm_package_version || "1.2.0";
var REPO_URL = "https://github.com/kguzek/usos-survey-filler";
var cardIntro = boxen(
  chalk.white(`
Witaj w USOS Survey Filler ${VERSION}!

Tw\xF3rca: Konrad Guzek
GitHub: ${chalk.underline("https://github.com/kguzek")}
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
  
${chalk.underline(REPO_URL)}
`),
  {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "yellow",
    textAlignment: "center"
  }
);
var cardError = boxen(
  chalk.white(`
Wyst\u0105pi\u0142 nieoczekiwany b\u0142\u0105d podczas wykonywania aplikacji.
Je\u015Bli problem b\u0119dzie si\u0119 powtarza\u0142, zg\u0142o\u015B go na GitHubie:

${chalk.underline(REPO_URL + "/issues/new")}
`),
  {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "red",
    textAlignment: "center"
  }
);
program.version(VERSION).description("USOS Survey Filler");
var printRaw = (emoji, message) => console.log(
  `
${emoji} ${chalk.dim("[")}${chalk.bgCyan.black("USOS Survey Filler")}${chalk.reset.dim("]")} ${message}
`
);
var printInfo = (message) => printRaw("\u2139", chalk.cyan(message));
var printError = (message) => printRaw("\u274C", chalk.red(message));
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
  printInfo("Trwa instalacja programu...");
  execSync("npx puppeteer browser install chrome", { stdio: "inherit" });
  printInfo("Instalacja uko\u0144czona. Uruchamianie programu...");
  try {
    execSync("npm run start", { stdio: "inherit" });
    console.log(cardOutro);
  } catch {
    printError("Program zako\u0144czy\u0142 si\u0119 niezerowym kodem wyj\u015Bcia.");
    console.log(cardError);
  }
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map