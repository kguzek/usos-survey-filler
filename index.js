$.expr.pseudos.textEquals = function (elem, i, match) {
  return $(elem).text().trim() === match[3];
};

function nextSurvey() {
  const surveysLink = $("a:textEquals('moje ankiety')");
  if (surveysLink.length > 0) {
    surveysLink[0].click();
  } else {
    console.debug("Nie znaleziono linku do ankiet, zakładam że już tam jestem");
  }
  $(document).ajaxComplete(function () {
    const surveys = $("ul.no-bullets.separated li.flex");
    if (surveys.length === 0) {
      alert("Wszystkie ankiety wypełnione");
      return;
    }
    const firstSurvey = surveys.eq(0);
    const name = firstSurvey
      .find("a")
      .filter(function () {
        return this.href.includes("/osoby/");
      })
      .text()
      .trim()
      .split(/\s+/)
      .join(" ");
    console.info("Próba wypełnienia ankiety dla:", name);
    const link = firstSurvey.find("a:textEquals('Wypełnij ankietę')");
    if (link.length !== 1) {
      alert("Nie znaleziono linku do ankiety dla: " + name);
      return;
    }
    link[0].click();
    $(document).ajaxComplete(function () {
      fillSurvey();
    });
  });
}

function fillSurvey() {
  $('label:contains("68-100")')
    .filter(function () {
      return $(this).find('input[type="radio"]').length > 0;
    })[0]
    .click();

  $("label:textEquals('tak')").each(function () {
    this.click();
  });

  $("label:textEquals('raczej się zgadzam')").each(function () {
    this.click();
  });
}

nextSurvey();
