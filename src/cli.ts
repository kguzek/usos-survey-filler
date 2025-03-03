#!/usr/bin/env node
/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */
import { execSync } from "child_process";
import { writeFile } from "fs/promises";
import { input } from "@inquirer/prompts";
import { program } from "commander";
import { config } from "dotenv";

program.version("1.0.0").description("USOS Survey Filler");

program.action(async () => {
  config();

  const username =
    process.env.USOS_USERNAME ||
    (await input({
      message:
        "Nazwa użytkownika do logowania przez USOS (zostaw puste dla ręcznego logowania):",
    }));

  const password =
    process.env.USOS_PASSWORD ||
    (await input({
      message: "Hasło do logowania przez USOS (zostaw puste dla ręcznego logowania):",
    }));

  // Create a .env file with the provided values
  const envContent = `USOS_USERNAME=${username}\nUSOS_PASSWORD=${password}`;

  await writeFile(".env", envContent);

  config();

  console.info("[USOS Survey Filler] Trwa instalacja programu...\n");
  execSync("npm install", { stdio: "inherit" });
  execSync("npx puppeteer browser install chrome");

  execSync("npm start", { stdio: "inherit" });
});
