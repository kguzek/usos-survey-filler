/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */

import { execSync } from "child_process";
import { writeFile } from "fs/promises";
import { input, password } from "@inquirer/prompts";
import boxen from "boxen";
import chalk from "chalk";
import { program } from "commander";
import { config } from "dotenv";

import { SurveyFiller } from "./survey-filler";

const VERSION = process.env.npm_package_version || "1.2.0";
const REPO_URL = "https://github.com/kguzek/usos-survey-filler";
const KNOWN_ERROR_MESSAGES = [
  "Most likely the page has been closed",
  "Navigating frame was detached",
  "Target closed",
];

const cardIntro = boxen(
  chalk.white(`
Witaj w USOS Survey Filler ${VERSION}!

Twórca: Konrad Guzek
GitHub: ${chalk.underline("https://github.com/kguzek")}
Email: konrad@guzek.uk
`),
  {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "cyan",
    textAlignment: "center",
  },
);

const cardOutro = boxen(
  chalk.white(`
Dziękuję za korzystanie z USOS Survey Filler.

⭐ Zostaw mi gwiazdkę na GitHubie! ⭐
  
${chalk.underline(REPO_URL)}
`),
  {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "yellow",
    textAlignment: "center",
  },
);

const cardError = boxen(
  chalk.white(`
Wystąpił nieoczekiwany błąd podczas wykonywania aplikacji.
Jeśli problem będzie się powtarzał, zgłoś go na GitHubie:

${chalk.underline(REPO_URL + "/issues/new")}
`),
  {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "red",
    textAlignment: "center",
  },
);

program.version(VERSION).description("USOS Survey Filler");

const printRaw = (emoji: string, message: string) =>
  console.log(
    `\n${emoji} ${chalk.dim("[")}${chalk.bgCyan.black("USOS Survey Filler")}${chalk.reset.dim("]")} ${message}\n`,
  );
const printInfo = (message: string) => printRaw("🤖", chalk.cyan(message));
const printError = (message: string) => printRaw("❌", chalk.red(message));
const printWarning = (message: string) => printRaw("⚠️", chalk.yellow(message));

program.action(async () => {
  config();

  console.log(cardIntro);

  const username =
    process.env.USOS_USERNAME ||
    (await input({
      message: "👤 Nazwa użytkownika do USOSa (opcjonalne):",
    }));

  const userPassword =
    process.env.USOS_PASSWORD ||
    (await password({
      message: "🔑 Hasło do USOSa (opcjonalne):",
      mask: "*",
    }));

  if (userPassword !== "" || username !== "") {
    // Create a .env file with the provided values
    const envContent = `USOS_USERNAME=${username}\nUSOS_PASSWORD=${userPassword}`;
    await writeFile(".env", envContent);
  }

  printInfo("Trwa instalacja programu...");
  execSync("npx puppeteer browsers install chrome", { stdio: "inherit" });
  printInfo("Instalacja ukończona. Uruchamianie programu...");
  try {
    const surveyFiller = new SurveyFiller(username, userPassword);
    await surveyFiller.start();
    console.log(cardOutro);
  } catch (error) {
    if (error instanceof Error) {
      if (KNOWN_ERROR_MESSAGES.find((msg) => error.message.includes(msg))) {
        console.log(cardOutro);
        return;
      }
      printWarning(chalk.yellow(error.message));
    }
    printError("Program zakończył się niezerowym kodem wyjścia.");
    console.log(cardError);
    process.exitCode = 1;
  }
});

program.parse(process.argv);
