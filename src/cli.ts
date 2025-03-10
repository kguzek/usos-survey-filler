/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */

import { writeFile } from "fs/promises";
import { confirm, input, password } from "@inquirer/prompts";
import chalk from "chalk";
import { program } from "commander";
import { config } from "dotenv";
import ora from "ora";

import { detectUserBrowser, installBrowser } from "./browser";
import {
  cardError,
  cardErrorNoHeadless,
  cardIntro,
  cardOutro,
  formatInfo,
  printError,
  printInfo,
  printWarning,
  VERSION,
} from "./logging";
import { SurveyFiller } from "./survey-filler";

const KNOWN_ERROR_MESSAGES = [
  "Most likely the page has been closed",
  "Navigating frame was detached",
  "Target closed",
  "Frame detached",
];

program
  .version(VERSION, "-v, --version", "Wyświetl numer wersji")
  .description("USOS Survey Filler")
  .helpOption("-h, --help", "Wyświetl dostępne opcje")
  .option(
    "-l, --headless",
    "Uruchom bez interfejsu graficznego (wymaga podania loginu i hasła w CLI)",
  )
  .option(
    "-c, --hardcoded",
    "Wypełnia ankiety tymi samymi odpowiedziami (68-100%; tak; raczej się zgadzam)",
  );

program.action(async () => {
  config();

  console.log(cardIntro);
  const options = program.opts();

  const optional = options.headless ? "" : " (opcjonalne)";
  const username =
    process.env.USOS_USERNAME ||
    (await input({
      message: `👤 Nazwa użytkownika do USOSa${optional}:`,
    }));

  const userPassword =
    process.env.USOS_PASSWORD ||
    (await password({
      message: `🔑 Hasło do USOSa${optional}:`,
      mask: "*",
    }));

  if (userPassword !== "" || username !== "") {
    // Create a .env file with the provided values
    const envContent = `USOS_USERNAME=${username}\nUSOS_PASSWORD=${userPassword}`;
    await writeFile(".env", envContent);
  }

  let browserConfig = detectUserBrowser();

  if (browserConfig == null) {
    printInfo(
      "Nie wykryto ściezki instalacyjnej przeglądarki. Myślisz, że to w błędzie? Zgłoś na GitHubie!",
    );
  } else {
    const useDetectedPath = await confirm({
      message: `Użyć wykrytej zainstalowanej przeglądarki: ${chalk.underline(browserConfig.path)}${chalk.reset("?")}`,
      transformer: (input) => (input ? chalk.green("Tak") : chalk.red("Nie")),
    });
    if (!useDetectedPath) {
      browserConfig = undefined;
    }
  }

  if (browserConfig == null) {
    await installBrowser();
  }

  const execution = ora({
    prefixText: formatInfo("Instalacja ukończona. Uruchamianie programu..."),
  }).start();
  try {
    const surveyFiller = new SurveyFiller(
      username,
      userPassword,
      options.headless,
      browserConfig,
      !options.hardcoded,
    );
    await surveyFiller.start();
    execution.succeed();
    printInfo(`Wypełnionych ankiet: ${surveyFiller.getSurveysFilled()}`);
    console.log(cardOutro);
  } catch (error) {
    if (error instanceof Error) {
      if (KNOWN_ERROR_MESSAGES.find((msg) => error.message.includes(msg))) {
        execution.succeed();
        printInfo("Program zamknięty przez użytkownika.");
        console.log(cardOutro);
        return;
      }
      if (error.message === "Tryb headless wymaga podania loginu i hasła.") {
        execution.fail();
        printError(error.message);
        return;
      }
    }
    execution.fail();
    printWarning(error instanceof Error ? error.message : `Nieznany błąd: ${error}`);
    console.log(options.headless ? cardError : cardErrorNoHeadless);
    process.exitCode = 1;
  }
});

program.parse(process.argv);
