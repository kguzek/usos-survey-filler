#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */
const child_process_1 = require("child_process");
const promises_1 = require("fs/promises");
const prompts_1 = require("@inquirer/prompts");
const commander_1 = require("commander");
const dotenv_1 = require("dotenv");
commander_1.program.version("1.0.0").description("USOS Survey Filler");
commander_1.program.action(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, dotenv_1.config)();
    const username = process.env.USOS_USERNAME ||
        (yield (0, prompts_1.input)({
            message: "Nazwa użytkownika do logowania przez USOS (zostaw puste dla ręcznego logowania):",
        }));
    const password = process.env.USOS_PASSWORD ||
        (yield (0, prompts_1.input)({
            message: "Hasło do logowania przez USOS (zostaw puste dla ręcznego logowania):",
        }));
    // Create a .env file with the provided values
    const envContent = `USOS_USERNAME=${username}\nUSOS_PASSWORD=${password}`;
    yield (0, promises_1.writeFile)(".env", envContent);
    (0, dotenv_1.config)();
    console.info("[USOS Survey Filler] Trwa instalacja programu...\n");
    (0, child_process_1.execSync)("npm install", { stdio: "inherit" });
    (0, child_process_1.execSync)("npx puppeteer browser install chrome");
    (0, child_process_1.execSync)("npm start", { stdio: "inherit" });
}));
