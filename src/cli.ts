/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */

import { writeFile } from "fs/promises";
import { input, password } from "@inquirer/prompts";
import { Browser, BrowserPlatform, install, resolveBuildId } from "@puppeteer/browsers";
import boxen from "boxen";
import chalk from "chalk";
import { program } from "commander";
import { config } from "dotenv";
import ora from "ora";

import { SurveyFiller } from "./survey-filler";

const VERSION = process.env.npm_package_version || "1.3.2";
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

const formatMessage = (emoji: string, message: string) =>
  `\n${emoji} ${chalk.dim("[")}${chalk.bgCyan.black("USOS Survey Filler")}${chalk.reset.dim("]")} ${message}`;
const formatInfo = (message: string) => formatMessage("🤖", chalk.cyan(message));
const formatError = (message: string) => "\n" + formatMessage("❌", chalk.red(message));
const printWarning = (message: string) =>
  console.warn(formatMessage("⚠️", chalk.yellow(message)));

function getPuppeteerPlatform(nodePlatform: string): BrowserPlatform {
  switch (nodePlatform) {
    case "win32":
      return BrowserPlatform.WIN64;
    case "darwin":
      return BrowserPlatform.MAC;
    case "linux":
      return BrowserPlatform.LINUX;
    default:
      throw new Error(`Unsupported platform: ${nodePlatform}`);
  }
}

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

  const installation = ora({
    prefixText: formatInfo("Trwa instalacja programu..."),
  }).start();

  try {
    const cacheDir = "./.puppeteer-cache";
    const platform = getPuppeteerPlatform(process.platform);
    const browser = Browser.CHROME;
    const buildId = await resolveBuildId(browser, platform, "latest");

    await install({
      cacheDir,
      platform,
      buildId,
      browser,
    });
  } catch (error) {
    if (error instanceof Error) {
      printWarning(error.message);
    }
    installation.fail(
      formatError("Nie udało się zainstalować przeglądarki dla Puppeteer."),
    );
    console.log(cardError);
    process.exitCode = 1;
    return;
  }

  installation.succeed();
  const execution = ora({
    prefixText: formatInfo("Instalacja ukończona. Uruchamianie programu..."),
  }).start();
  try {
    const surveyFiller = new SurveyFiller(username, userPassword);
    await surveyFiller.start();
    execution.succeed();
    console.log(cardOutro);
  } catch (error) {
    if (error instanceof Error) {
      if (KNOWN_ERROR_MESSAGES.find((msg) => error.message.includes(msg))) {
        execution.succeed(formatInfo("Program zamknięty przez użytkownika."));
        console.log(cardOutro);
        return;
      }
      printWarning(error.message);
    }
    execution.fail(formatError("Program zakończył się niezerowym kodem wyjścia."));
    console.log(cardError);
    process.exitCode = 1;
  }
});

program.parse(process.argv);
