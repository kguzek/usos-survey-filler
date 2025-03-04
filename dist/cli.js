// src/cli.ts
import { writeFile } from "fs/promises";
import { input, password } from "@inquirer/prompts";
import { Browser, BrowserPlatform, install, resolveBuildId } from "@puppeteer/browsers";
import boxen from "boxen";
import chalk from "chalk";
import { program } from "commander";
import { config } from "dotenv";
import ora from "ora";

// src/survey-filler.ts
import puppeteer from "puppeteer";
var USOS_HOME_URL = "https://web.usos.pwr.edu.pl/kontroler.php?_action=home/index";
var USOS_LOGIN_URL = "https://login.pwr.edu.pl/auth/realms/pwr.edu.pl/protocol/cas/login?service=https%3A%2F%2Fweb.usos.pwr.edu.pl%2Fkontroler.php%3F_action%3Dlogowaniecas%2Findex";
var USOS_SURVEYS_HOMEPAGE = "https://web.usos.pwr.edu.pl/kontroler.php?_action=dla_stud/studia/ankiety/index";
var SurveyFiller = class {
  page;
  browser;
  surveys = [];
  usosUsername;
  usosPassword;
  constructor(username, password2) {
    this.usosUsername = username || "";
    this.usosPassword = password2 || "";
  }
  async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ["--window-size=1600,900", "--window-position=100,100"]
    });
    const pages = await this.browser.pages();
    await pages[0].close();
    this.page = await this.browser.newPage();
    this.page.setViewport({ width: 1600, height: 900 });
  }
  async wait() {
    await this.page.waitForNavigation({ waitUntil: "networkidle0" });
  }
  async navigate(url) {
    await this.page.goto(url, { waitUntil: "networkidle0" });
  }
  showAlert(message) {
    return this.page.evaluate(
      (message2) => alert(`[USOS Survey Filler] ${message2}`),
      message
    );
  }
  async manualLogin(alertMessage) {
    await this.showAlert(alertMessage);
    while (this.page.url() !== USOS_HOME_URL) {
      await this.wait();
    }
  }
  async automaticLogin() {
    await this.page.click("button.login");
    await this.wait();
    if (this.page.url() !== USOS_HOME_URL) {
      await this.manualLogin(
        "Niepoprawne dane loginowe. Prosz\u0119 zalogowa\u0107 si\u0119 manualnie."
      );
    }
  }
  async loginToUsos() {
    await this.navigate(USOS_LOGIN_URL);
    const usernameEmpty = this.usosUsername === "";
    const passwordEmpty = this.usosPassword === "";
    await this.page.waitForSelector("#username");
    if (!usernameEmpty) {
      await this.page.type("#username", this.usosUsername, { delay: 40 });
    }
    if (passwordEmpty) {
      if (!usernameEmpty) {
        await this.page.focus("#password");
      }
    } else {
      await this.page.type("#password", this.usosPassword, { delay: 40 });
    }
    if (usernameEmpty || passwordEmpty) {
      await this.manualLogin("Prosz\u0119 si\u0119 zalogowa\u0107 manualnie.");
    } else {
      await this.automaticLogin();
    }
  }
  getAllSurveys() {
    return this.page.$$eval(
      "ul.no-bullets.separated li.flex",
      (surveys) => surveys.map((survey) => {
        const links = survey.querySelectorAll("a");
        const name = links[1].textContent?.trim().replace(/\s+/g, " ") ?? null;
        const link = links[2].getAttribute("href");
        return { name, link };
      })
    );
  }
  async navigateToSurveys() {
    await this.navigate(USOS_SURVEYS_HOMEPAGE);
  }
  async fillSurvey(survey) {
    if (survey == null || survey.link === null) {
      throw new Error("Survey link is null: " + JSON.stringify(survey));
    }
    console.info("Filling out survey for", survey.name);
    await this.navigate(survey.link);
    await this.page.$$eval("label", (labels) => {
      labels.forEach((label) => {
        const textContent = label.textContent?.trim().replace(/\s+/g, " ") ?? null;
        if (textContent == null) {
          return;
        }
        const SECTION_ANSWERS = [
          "68-100 %",
          "tak",
          "raczej si\u0119 zgadzam"
        ];
        if (SECTION_ANSWERS.includes(textContent)) {
          label.click();
        }
      });
    });
    const submitButton = await this.page.$("input.positive[type=button]");
    if (submitButton == null) {
      throw new Error("Survey submit button not found");
    }
    await submitButton.click();
    await this.wait();
  }
  async start() {
    await this.init();
    await this.loginToUsos();
    this.surveys = await this.getAllSurveys();
    while (this.surveys.length > 0) {
      await this.navigateToSurveys();
      const survey = this.surveys.pop();
      if (survey == null) {
        console.warn("Nullish survey, skipping...");
        continue;
      }
      await this.fillSurvey(survey);
    }
    await this.showAlert(
      "Wszystkie ankiety zosta\u0142y wype\u0142nione.\nDzi\u0119kuj\u0119 za korzystanie z aplikacji!\n\n~ kguzek"
    );
    await this.browser.close();
  }
};

// src/cli.ts
var VERSION = process.env.npm_package_version || "1.3.2";
var REPO_URL = "https://github.com/kguzek/usos-survey-filler";
var KNOWN_ERROR_MESSAGES = [
  "Most likely the page has been closed",
  "Navigating frame was detached",
  "Target closed"
];
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
var formatMessage = (emoji, message) => `
${emoji} ${chalk.dim("[")}${chalk.bgCyan.black("USOS Survey Filler")}${chalk.reset.dim("]")} ${message}`;
var formatInfo = (message) => formatMessage("\u{1F916}", chalk.cyan(message));
var printInfo = (message) => console.info(formatInfo(message));
var formatError = (message) => "\n" + formatMessage("\u274C", chalk.red(message));
var printError = (message) => console.error(formatError(message));
var printWarning = (message) => console.warn(formatMessage("\u26A0\uFE0F", chalk.yellow(message)));
function getPuppeteerPlatform(nodePlatform) {
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
  const username = process.env.USOS_USERNAME || await input({
    message: "\u{1F464} Nazwa u\u017Cytkownika do USOSa (opcjonalne):"
  });
  const userPassword = process.env.USOS_PASSWORD || await password({
    message: "\u{1F511} Has\u0142o do USOSa (opcjonalne):",
    mask: "*"
  });
  if (userPassword !== "" || username !== "") {
    const envContent = `USOS_USERNAME=${username}
USOS_PASSWORD=${userPassword}`;
    await writeFile(".env", envContent);
  }
  const installation = ora({
    prefixText: formatInfo("Trwa instalacja programu...")
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
      browser
    });
  } catch (error) {
    if (error instanceof Error) {
      printWarning(error.message);
    }
    installation.fail();
    printError("Nie uda\u0142o si\u0119 zainstalowa\u0107 przegl\u0105darki dla Puppeteer."), console.log(cardError);
    process.exitCode = 1;
    return;
  }
  installation.succeed();
  const execution = ora({
    prefixText: formatInfo("Instalacja uko\u0144czona. Uruchamianie programu...")
  }).start();
  try {
    const surveyFiller = new SurveyFiller(username, userPassword);
    await surveyFiller.start();
    execution.succeed();
    console.log(cardOutro);
  } catch (error) {
    if (error instanceof Error && KNOWN_ERROR_MESSAGES.find((msg) => error.message.includes(msg))) {
      execution.succeed();
      printInfo("Program zamkni\u0119ty przez u\u017Cytkownika.");
      console.log(cardOutro);
      return;
    }
    execution.fail();
    printWarning(error instanceof Error ? error.message : `Nieznany b\u0142\u0105d: ${error}`);
    console.log(cardError);
    process.exitCode = 1;
  }
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map