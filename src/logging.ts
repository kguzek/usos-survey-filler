/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */

import boxen from "boxen";
import chalk from "chalk";

const REPO_URL = "https://github.com/kguzek/usos-survey-filler";
export const VERSION = process.env.npm_package_version || "1.5.0";

export const cardIntro = boxen(
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

export const cardOutro = boxen(
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

const generateErrorCard = (text: string) =>
  boxen(chalk.white(text), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "red",
    textAlignment: "center",
  });

export const cardError = generateErrorCard(`
Wystąpił nieoczekiwany błąd podczas wykonywania aplikacji.
Jeśli problem będzie się powtarzał, zgłoś go na GitHubie:

${chalk.underline(REPO_URL + "/issues/new")}
`);

export const cardErrorNoHeadless = generateErrorCard(`
Wystąpił błąd podczas wykonywania aplikacji.
Spróbuj uruchomić program z flagą -l/--headless:

npx usos-survey-filler -l
`);

const formatMessage = (emoji: string, message: string) =>
  `\n${emoji} ${chalk.dim("[")}${chalk.bgCyan.black("USOS Survey Filler")}${chalk.reset.dim("]")} ${message}`;
export const formatInfo = (message: string) => formatMessage("🤖", chalk.cyan(message));
const formatError = (message: string) => "\n" + formatMessage("❌", chalk.red(message));
export const printInfo = (message: string) => console.info(formatInfo(message));
export const printError = (message: string) => console.error(formatError(message));
export const printWarning = (message: string) =>
  console.warn(formatMessage("⚠️", chalk.yellow(message)));
