/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */

import { execSync } from "child_process";
import { writeFile } from "fs/promises";
import { input } from "@inquirer/prompts";
import boxen from "boxen";
import chalk from "chalk";
import { program } from "commander";
import { config } from "dotenv";

import packageJson from "../package.json";

const VERSION = packageJson.version;

const cardIntro = boxen(
  chalk.white(`
  Witaj w USOS Survey Filler ${VERSION}!
  
  Twórca: Konrad Guzek
  GitHub: https://github.com/kguzek
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
  
  https://github.com/kguzek/usos-survey-filler
`),
  {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "yellow",
    textAlignment: "center",
  },
);

program.version(VERSION).description("USOS Survey Filler");

const print = (message: string) =>
  console.log(
    `\n${chalk.dim("[")}${chalk.bgCyan.white("USOS Survey Filler")}${chalk.reset.dim("]")} ${chalk.cyan(message)}\n`,
  );

program.action(async () => {
  config();

  console.log(cardIntro);

  const username =
    process.env.USOS_USERNAME ||
    (await input({
      message: "👤 Nazwa użytkownika do USOSa (opcjonalne):",
    }));

  const password =
    process.env.USOS_PASSWORD ||
    (await input({
      message: "🔑 Hasło do USOSa (opcjonalne):",
    }));

  if (password !== "" || username !== "") {
    // Create a .env file with the provided values
    const envContent = `USOS_USERNAME=${username}\nUSOS_PASSWORD=${password}`;
    await writeFile(".env", envContent);
  }

  config();

  print("Trwa instalacja programu...");
  execSync("npm install", { stdio: "inherit" });
  execSync("npx puppeteer browser install chrome", { stdio: "inherit" });
  print("Instalacja ukończona. Uruchamianie programu...");
  execSync("npm run start", { stdio: "inherit" });
  console.log(cardOutro);
});

program.parse(process.argv);
