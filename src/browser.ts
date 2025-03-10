/* SPDX-License-Identifier: AGPL-3.0-only */
/*            USOS Survey Filler          */
/*       Copyright © 2025 Konrad Guzek    */

import { existsSync } from "fs";
import { Browser, BrowserPlatform, install, resolveBuildId } from "@puppeteer/browsers";
import ora from "ora";

import type { BrowserConfig } from "./survey-filler";
import { cardError, formatInfo, printError, printWarning } from "./logging";

const BROWSER_CONFIGS: { [platform in NodeJS.Platform]?: BrowserConfig[] } = {
  win32: [
    {
      name: "chrome",
      path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    },
    {
      name: "chrome",
      path: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    },
    {
      name: "firefox",
      path: "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
    },
    { name: "firefox", path: "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe" },
  ],
  darwin: [
    {
      name: "chrome",
      path: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    },
    { name: "firefox", path: "/Applications/Firefox.app/Contents/MacOS/firefox" },
  ],
  linux: [
    {
      name: "chrome",
      path: "/usr/bin/google-chrome",
    },
    {
      name: "chrome",
      path: "/usr/local/bin/google-chrome",
    },
    {
      name: "firefox",
      path: "/usr/bin/firefox",
    },
    {
      name: "firefox",
      path: "/usr/local/bin/firefox",
    },
  ],
};

export function detectUserBrowser(): BrowserConfig | undefined {
  const paths = BROWSER_CONFIGS[process.platform] ?? [];
  return paths.find(({ path }) => existsSync(path));
}

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

export async function installBrowser() {
  const installation = ora({
    prefixText: formatInfo("Trwa instalacja tymczasowej wersji Chrome..."),
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
    installation.fail();
    if (error instanceof Error) {
      printWarning(error.message);
    } else {
      printWarning(`Nieznany błąd instalacyjny: ${error}`);
    }
    printError("Nie udało się zainstalować przeglądarki dla Puppeteer."),
      console.log(cardError);
    process.exitCode = 1;
    return;
  }

  installation.succeed();
}
