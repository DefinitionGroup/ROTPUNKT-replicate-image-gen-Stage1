# FLUX.1 Generation V3

## Ziel

Die bestehende FLUX.1-Dev-LoRA soll ohne erneutes Training zuverlässiger genau eine funktionsfähige Nasszone sowie korrekt identifizierte und innerhalb einzelner Fronten montierte Griffe erzeugen.

## Leitplanken

- Kein LoRA-Retraining und keine automatischen kostenpflichtigen Testläufe.
- Konstruktive Beziehungen stehen am Promptanfang und vor Stil, Licht und Dekor.
- Der Modell-Prompt erhält ein Arbeitsbudget von 180 Wörtern. Pflichtabschnitte werden nie abgeschnitten; optionale Abschnitte werden nach Priorität aufgenommen.
- Das LoRA-Triggerwort wird serverseitig genau einmal ergänzt.
- Küchen erzeugen zunächst zwei Kandidaten in einem Replicate-Lauf; andere Räume weiterhin einen.
- Seed, Promptversion und Modellparameter werden für reproduzierbare Vergleiche durch den gesamten Request geführt.

## Umsetzung

### 1. Strukturierter V3-Prompt

1. Rotpunkt-Motiv und Raumtyp
2. Nasszonen-Topologie
3. Griffart und Montagegeometrie
4. Frontfarbe und Material
5. Küchenlayout
6. Perspektive und Kamera
7. Licht, Umgebung, Boden
8. Zubehör und freie Wünsche, soweit das Promptbudget reicht

Die Nasszone wird aus freien Wünschen auf `wall_run`, `island` oder `peninsula` aufgelöst. Ohne expliziten Wunsch gilt `wall_run`. Genau an diesem Ort werden ein Becken und eine Mischarmatur als zusammengehöriges Paar beschrieben; alle übrigen Arbeitsplatten bleiben trockene, durchgehende Flächen.

### 2. Explizite Griffmetadaten

Jeder Katalogeintrag wird vor dem Promptbau in eine konstruktive Griffart überführt:

- `handleless`: kein Beschlag, keine Montagepunkte
- `tokyo_grip`: integriertes Profil je einzelner Front
- `t_bar`: ein zentraler Montagepunkt
- `bar_pull`: zwei Montagefüße auf derselben Front
- `knob`: ein Montagepunkt
- `generic`: unbekannte Montagepunktzahl, aber vollständige Frontzuordnung

Der Promptbuilder arbeitet mit diesen Daten und nicht mehr mit verstreuter Freitext-Erkennung.

### 3. Reproduzierbare Generierung

- Promptversion: `flux1-v3`
- Guidance Scale: `3.2`
- LoRA Scale Küche: `0.85`
- LoRA Scale sonstige Räume: `0.65`
- Inferenzschritte: `28`
- Küchen-Kandidaten: `2`
- Seed: zufällig, aber in Start- und Statusantwort enthalten; optional explizit wiederholbar
- Persistenz: `generation_metadata` speichert Seed, Parameter, Kandidatenindex und QA-Erwartungen; bis die additive SQL-Migration eingespielt ist, fällt die Route kompatibel auf das bisherige `images`-Schema zurück.

### 4. Quality-Gate-Vertrag

Jeder Kandidat erhält einen stabilen QA-Status und die erwartete Topologie. In dieser Stufe wird noch kein unvalidiertes Drittanbieter-Visionmodell automatisch aufgerufen. Der Vertrag erlaubt anschließend einen kontrollierten Vision-QA-Schritt mit folgenden harten Ablehnungsgründen:

- Anzahl Spülen ungleich eins
- Anzahl Armaturen ungleich eins
- Armatur ohne sichtbares Becken
- zweite Nasszone außerhalb des gewählten Orts
- Griff überquert eine Frontfuge oder verbindet zwei Türen
- falsche Griffart

Bis ein Visionmodell per festem Testsatz validiert ist, werden Kandidaten als `not_evaluated` zurückgegeben und nicht fälschlich als geprüft bezeichnet.

## Verifikation

- TypeScript und ESLint für alle geänderten Dateien
- Produktions-Build
- feste Prompt-Audits für grifflos, Tokyo, T-Bar, Bar-Pull und Knopf
- Wortbudget und Reihenfolge der Pflichtabschnitte prüfen
- sicherstellen, dass der Trigger serverseitig genau einmal vorkommt
- keine Replicate-Prediction im Rahmen der Implementierung starten

## Noch notwendiger visueller Abnahmetest

Nach Deployment wird ein kleiner, bezahlter A/B-Test mit festen Seeds ausgeführt:

1. fünf repräsentative Küchenkonfigurationen
2. je Konfiguration identischer Seed
3. LoRA Scale `0.65`, `0.75`, `0.85`
4. Bewertung von Nasszone, Griffart, Montage, Fronttreue und Gesamtbild
5. erst danach Auswahl der produktiven LoRA Scale und Aktivierung eines Vision-QA-Modells
