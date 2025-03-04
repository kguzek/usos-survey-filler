# USOS Survey Filler

<img height="12" src="https://flagcdn.com/w80/gb.png" alt="EN" /> [English version](https://github.com/kguzek/usos-survey-filler#readme)

USOS Survery Filler to narzędzie napisane przy użyciu biblioteki Puppeteer do automatycznego wypełniania ankiet o prowadzących na platformie Uniwersysteckiego Systemu Obsługi Studiów Politechniki Wrocławskiej.

Możliwe, że również działa dla innych polskich uczelni korzystających z USOSa, ale zostało przetestowane tylko dla Politechniki Wrocławskiej.

## Jak skorzystać?

[Zainstaluj Node.js](https://nodejs.org/pl/) i uruchom następujące polecenie:

```bash
npx usos-survey-filler
```

## Automatyczne logowanie

Domyślnie aplikacja prosi o dane logowania do USOS przez wiersz poleceń. Jeśli je pominiesz, będziesz musiał zalogować się przez okno przeglądarki Puppeteer.

Jeśli podasz dane logowania, zostaną one zapisane na Twoim komputerze w pliku `.env` i będą ponownie wykorzystywane podczas przyszłych uruchomień.

Możesz pominąć prośby o dane logowania, określając zmienne środowiskowe `USOS_USERNAME` i `USOS_PASSWORD`.

## FAQ

1. 🥶 Przeglądarka sie nie uruchamia! (zwykle na systemach GNU/Linux)
   - Spróbuj użyć trybu headless (--headless lub -l)

2. 😕 Pokazuje, że wypełniono 0 ankiet...
   - Spróbuj nie używać wykrytej przeglądarki (wpisz N jak się zapyta)

3. ❓ Jakimi odpowiedziami wypełnia ankiety?
   - Program losuje odpowiedzi z ustalonymi wagami, tak, że preferuje w kolejności lekko pozytywne odpowiedzi, potem neutralne, potem bardzo pozytywne i na koniec negatywne. Najwięcej odpowiedzi będzie stosunkowo pozytywnych (typu "raczej się zgadzam").

## To wszystko

Jeśli ten projekt się Tobie przydał, [dodaj gwiazdkę](https://github.com/kguzek/usos-survey-filler)! ⭐

Jeśli masz sugestię, feedback lub chcesz zgłosić błąd, [stwórz *issue*](https://github.com/kguzek/usos-survey-filler/issues/new).

## Prawa autorskie

SPDX-License-Identifier: AGPL-3.0-only

USOS Survey Filler

Copyright © 2025 Konrad Guzek

Aplikacja nie jest wspierana przez USOS, Międzyuniwersyteckie Centrum Informatyzacji ani przez Politechnikę Wrocławską. Wszelkie prawa autorskie poza tymi do kodo źródłowego tego programu należą do odpowiednich podmiotów.
