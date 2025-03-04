import { existsSync } from "fs";
import { Browser, BrowserPlatform, install, resolveBuildId } from "@puppeteer/browsers";
import ora from "ora";

import { cardError, formatInfo, printError, printWarning } from "./logging";

const pathsByOS: { [platform in NodeJS.Platform]?: string[] } = {
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
    "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe",
  ],
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Firefox.app/Contents/MacOS/firefox",
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/firefox",
    "/usr/local/bin/google-chrome",
    "/usr/local/bin/firefox",
  ],
};

export function detectUserBrowser() {
  const paths = pathsByOS[process.platform] ?? [];
  return paths.find((path) => existsSync(path));
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
    if (error instanceof Error) {
      printWarning(error.message);
    }
    installation.fail();
    printError("Nie udało się zainstalować przeglądarki dla Puppeteer."),
      console.log(cardError);
    process.exitCode = 1;
    return;
  }

  installation.succeed();
}
