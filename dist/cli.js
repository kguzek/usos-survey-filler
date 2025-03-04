// src/cli.ts
import { writeFile } from "fs/promises";
import { confirm, input, password } from "@inquirer/prompts";
import chalk2 from "chalk";
import { program } from "commander";
import { config } from "dotenv";
import ora2 from "ora";

// src/browser.ts
import { existsSync } from "fs";
import { Browser, BrowserPlatform, install, resolveBuildId } from "@puppeteer/browsers";
import ora from "ora";

// src/logging.ts
import boxen from "boxen";
import chalk from "chalk";
var REPO_URL = "https://github.com/kguzek/usos-survey-filler";
var VERSION = process.env.npm_package_version || "1.4.4";
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
var generateErrorCard = (text) => boxen(chalk.white(text), {
  padding: 1,
  margin: 1,
  borderStyle: "round",
  borderColor: "red",
  textAlignment: "center"
});
var cardError = generateErrorCard(`
Wyst\u0105pi\u0142 nieoczekiwany b\u0142\u0105d podczas wykonywania aplikacji.
Je\u015Bli problem b\u0119dzie si\u0119 powtarza\u0142, zg\u0142o\u015B go na GitHubie:

${chalk.underline(REPO_URL + "/issues/new")}
`);
var cardErrorNoHeadless = generateErrorCard(`
Wyst\u0105pi\u0142 b\u0142\u0105d podczas wykonywania aplikacji.
Spr\xF3buj uruchomi\u0107 program z flag\u0105 -l/--headless:

npx usos-survey-filler -l
`);
var formatMessage = (emoji, message) => `
${emoji} ${chalk.dim("[")}${chalk.bgCyan.black("USOS Survey Filler")}${chalk.reset.dim("]")} ${message}`;
var formatInfo = (message) => formatMessage("\u{1F916}", chalk.cyan(message));
var formatError = (message) => "\n" + formatMessage("\u274C", chalk.red(message));
var printInfo = (message) => console.info(formatInfo(message));
var printError = (message) => console.error(formatError(message));
var printWarning = (message) => console.warn(formatMessage("\u26A0\uFE0F", chalk.yellow(message)));

// src/browser.ts
var pathsByOS = {
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
    "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe"
  ],
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Firefox.app/Contents/MacOS/firefox"
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/firefox",
    "/usr/local/bin/google-chrome",
    "/usr/local/bin/firefox"
  ]
};
function detectUserBrowser() {
  const paths = pathsByOS[process.platform] ?? [];
  return paths.find((path) => existsSync(path));
}
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
async function installBrowser() {
  const installation = ora({
    prefixText: formatInfo("Trwa instalacja tymczasowej wersji Chrome...")
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
    installation.fail();
    if (error instanceof Error) {
      printWarning(error.message);
    } else {
      printWarning(`Nieznany b\u0142\u0105d instalacyjny: ${error}`);
    }
    printError("Nie uda\u0142o si\u0119 zainstalowa\u0107 przegl\u0105darki dla Puppeteer."), console.log(cardError);
    process.exitCode = 1;
    return;
  }
  installation.succeed();
}

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
  headless;
  surveysFilled = 0;
  browserPath;
  randomAnswers;
  constructor(username, password2, headless = false, browserPath, randomAnswers = false) {
    this.usosUsername = username || "";
    this.usosPassword = password2 || "";
    this.headless = headless;
    if (headless && (this.usosUsername === "" || this.usosPassword === "")) {
      throw new Error("Tryb headless wymaga podania loginu i has\u0142a.");
    }
    this.browserPath = browserPath;
    this.randomAnswers = randomAnswers;
  }
  getSurveysFilled() {
    return this.surveysFilled;
  }
  async init() {
    this.browser = await puppeteer.launch({
      headless: this.headless ? void 0 : false,
      args: ["--window-size=1600,900", "--window-position=100,100"],
      executablePath: this.browserPath
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
  showAlert(message, optional = false) {
    if (this.headless) {
      if (!optional) {
        throw new Error(message);
      }
      return;
    }
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
      const percentageAnswers = [
        "0-33 %",
        "34-67 %",
        "34-67 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
        "68-100 %",
        "68-100 %"
      ];
      const yesNoAnswers = ["nie", "tak", "tak", "tak", "tak", "tak", "tak"];
      const subjectiveAnswers = [
        "zdecydowanie si\u0119 nie zgadzam",
        "raczej si\u0119 nie zgadzam",
        "zdecydowanie si\u0119 zgadzam",
        "zdecydowanie si\u0119 zgadzam",
        "nie mam zdania",
        "nie mam zdania",
        "nie mam zdania",
        "raczej si\u0119 zgadzam",
        "raczej si\u0119 zgadzam",
        "raczej si\u0119 zgadzam",
        "raczej si\u0119 zgadzam",
        "raczej si\u0119 zgadzam",
        "raczej si\u0119 zgadzam",
        "raczej si\u0119 zgadzam",
        "raczej si\u0119 zgadzam"
      ];
      const getRandomItem = (array) => this.randomAnswers ? array[Math.floor(Math.random() * array.length)] : array.at(-1);
      labels.forEach((label) => {
        const textContent = label.textContent?.trim().replace(/\s+/g, " ") ?? null;
        if (textContent == null) {
          return;
        }
        const SECTION_ANSWERS = [
          getRandomItem(percentageAnswers),
          getRandomItem(yesNoAnswers),
          getRandomItem(subjectiveAnswers)
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
    this.surveysFilled++;
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
      "Wszystkie ankiety zosta\u0142y wype\u0142nione.\nDzi\u0119kuj\u0119 za korzystanie z aplikacji!\n\n~ kguzek",
      true
    );
    await this.browser.close();
  }
};

// src/cli.ts
var KNOWN_ERROR_MESSAGES = [
  "Most likely the page has been closed",
  "Navigating frame was detached",
  "Target closed"
];
program.version(VERSION).description("USOS Survey Filler").option(
  "-l, --headless",
  "Uruchom bez interfejsu graficznego (wymaga podania loginu i has\u0142a w CLI)"
).option(
  "-c, --hardcoded",
  "Wype\u0142nia ankiety tymi samymi odpowiedziami (68-100%; tak; raczej si\u0119 zgadzam)."
);
program.action(async () => {
  config();
  console.log(cardIntro);
  const options = program.opts();
  const optional = options.headless ? "" : " (opcjonalne)";
  const username = process.env.USOS_USERNAME || await input({
    message: `\u{1F464} Nazwa u\u017Cytkownika do USOSa${optional}:`
  });
  const userPassword = process.env.USOS_PASSWORD || await password({
    message: `\u{1F511} Has\u0142o do USOSa${optional}:`,
    mask: "*"
  });
  if (userPassword !== "" || username !== "") {
    const envContent = `USOS_USERNAME=${username}
USOS_PASSWORD=${userPassword}`;
    await writeFile(".env", envContent);
  }
  let browserPath = detectUserBrowser();
  if (browserPath == null) {
    printInfo(
      "Nie wykryto \u015Bciezki instalacyjnej przegl\u0105darki. My\u015Blisz, \u017Ce to w b\u0142\u0119dzie? Zg\u0142o\u015B na GitHubie!"
    );
  } else {
    const useDetectedPath = await confirm({
      message: `U\u017Cy\u0107 wykrytej zainstalowanej przegl\u0105darki: ${chalk2.underline(browserPath)}${chalk2.reset("?")}`,
      transformer: (input2) => input2 ? chalk2.green("Tak") : chalk2.red("Nie")
    });
    if (!useDetectedPath) {
      browserPath = void 0;
    }
  }
  if (browserPath == null) {
    await installBrowser();
  }
  const execution = ora2({
    prefixText: formatInfo("Instalacja uko\u0144czona. Uruchamianie programu...")
  }).start();
  try {
    const surveyFiller = new SurveyFiller(
      username,
      userPassword,
      options.headless,
      browserPath,
      !options.hardcoded
    );
    await surveyFiller.start();
    execution.succeed();
    printInfo(`Wype\u0142nionych ankiet: ${surveyFiller.getSurveysFilled()}`);
    console.log(cardOutro);
  } catch (error) {
    if (error instanceof Error) {
      if (KNOWN_ERROR_MESSAGES.find((msg) => error.message.includes(msg))) {
        execution.succeed();
        printInfo("Program zamkni\u0119ty przez u\u017Cytkownika.");
        console.log(cardOutro);
        return;
      }
      if (error.message === "Tryb headless wymaga podania loginu i has\u0142a.") {
        execution.fail();
        printError(error.message);
        return;
      }
    }
    execution.fail();
    printWarning(error instanceof Error ? error.message : `Nieznany b\u0142\u0105d: ${error}`);
    console.log(options.headless ? cardError : cardErrorNoHeadless);
    process.exitCode = 1;
  }
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map