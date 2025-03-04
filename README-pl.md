# USOS Survey Filler

[<img height="12" src="https://flagcdn.com/w80/gb.png" /> English version](https://github.com/kguzek/usos-survey-filler/blob/main/README.md)

USOS Survery Filler to narzędzie napisane przy użyciu biblioteki Puppeteer do automatycznego wypełniania ankiet o prowadzących na platformie Uniwersysteckiego Systemu Obsługi Studiów Politechniki Wrocławskiej.

Możliwe, że również działa dla innych polskich uczelni korzystających z USOSa, ale zostało przetestowane tylko dla Politechniki Wrocławskiej.

## Jak skorzystać?

Zainstaluj Node.js i uruchom następujące polecenie:

```bash
npx usos-survey-filler
```

## Automatyczne logowanie

Domyślnie aplikacja prosi o dane logowania do USOS przez wiersz poleceń. Jeśli je pominiesz, będziesz musiał zalogować się przez okno przeglądarki Puppeteer.

Jeśli podasz dane logowania, zostaną one zapisane na Twoim komputerze w pliku `.env` i będą ponownie wykorzystywane podczas przyszłych uruchomień.

Możesz pominąć prośby o dane logowania, określając zmienne środowiskowe `USOS_USERNAME` i `USOS_PASSWORD`.

## To wszystko

Jeśli ten projekt się Tobie przydał, dodaj gwiazdkę! ⭐

Jeśli masz sugestie lub chcesz zgłosić błąd, [stwórz *issue*](https://github.com/kguzek/usos-survey-filler/issues/new).

## Prawa autorskie

SPDX-License-Identifier: AGPL-3.0-only

USOS Survey Filler

Copyright © 2025 Konrad Guzek

Aplikacja nie jest wspierana przez USOS, Międzyuniwersyteckie Centrum Informatyzacji ani przez Politechnikę Wrocławską. Wszelkie prawa autorskie poza tymi do kodo źródłowego tego programu należą do odpowiednich podmiotów.
