# Plan: Inpainting-Reparatur für lokale Bildfehler

**Status:** Plan, nicht umgesetzt (3. September 2026)
**Baut auf:** `playbook-stabilisierung.md` (Abschnitte 2c/2d), `2Candidates-QualityGate.md`
**Ziel:** Einen abgelehnten Kandidaten mit einem *lokalen* Fehler – zweite Armatur, zweites Becken, fehlendes Kochfeld – gezielt reparieren, statt ihn zu verwerfen. Mit derselben Rotpunkt-LoRA, damit Fronten, Griffe und Materialien unverändert bleiben.

## 1. Warum Inpainting und warum mit der eigenen LoRA

Der Batch vom 3. September zeigt zwei Fehlerklassen: **strukturelle** (vertauschte Spülen-/Kochfeld-Position, falsche Inselanzahl, falsche Kamera) und **lokale** (Dubletten, fehlende Vorrichtung auf sonst richtiger Fläche). Strukturelle Fehler kann kein Editor beheben, ohne die Küche neu zu erfinden; sie bleiben Fall für neuen Seed oder Nachtraining. Lokale Fehler dagegen betreffen eine kleine Region – genau der Fall für Inpainting. Im Batch scheiterten mit Luna 4–5 von 30 Bildern an `sink_count` oder `faucet_count`; der Fehler vom 14. August gehört in diese Klasse.

Ein fremder Editor (FLUX Kontext, Nano Banana, GPT-Image, Qwen-Edit – alle auf Replicate) würde die Region reparieren, aber die Identität gefährden: Griffgeometrie, Frontstruktur, Farbton. Das Rotpunkt-LoRA-Modell `rotpunkt007/basemodel-5-2026` akzeptiert `image`, `mask` und `prompt_strength` (Schema am 3. September geprüft) – wir können also mit dem Modell reparieren, das die Identität gelernt hat. Fremdeditoren bleiben höchstens ein Fallback nach gescheiterter LoRA-Reparatur, dann mit hart geschalteten Identitäts-Checks.

## 2. Ablauf im Enforce-Modus

1. Kandidat generiert, hochgeladen, von Luna geprüft (wie heute, Versuch 1).
2. Urteil `fail`. **Triage:** reparabel, wenn *alle* fehlgeschlagenen harten Checks aus der lokalen Klasse stammen (`sink_count`, `faucet_count`, `cooktop_count`) **und** die weichen Ortschecks für die *korrekt gezählten* Vorrichtungen stimmen. Fällt zusätzlich ein struktureller Check (`sink_location`, `cooktop_location`, `island_count`, `camera_mode`, `scene_type`), ist der Kandidat nicht reparabel → wie heute verwerfen.
3. **Maske bauen:** Für jede überzählige Vorrichtung die von Luna gelieferte Bounding-Box (Abschnitt 3) mit Rand (ca. 6 % der Bildbreite) zu einer Maske vereinen. Für ein *fehlendes* Kochfeld: Region auf der vorgesehenen Arbeitsplatte aus der Box der Arbeitsplatte ableiten – das ist der schwierigere Fall und kommt zuletzt.
4. **Inpainting-Aufruf:** dasselbe Modell, gleicher Originalprompt plus eine Regionsanweisung – bei Dubletten „plain continuous worktop surface, matching the surrounding countertop", bei fehlendem Kochfeld „one flush black induction hob" –, gleicher Seed, `prompt_strength` kalibriert (Startwert 0,85), Maske als Bild.
5. Ergebnis nach MinIO (`set-<id>-variant-<i>-repair-1.webp`), **Versuch 2** in `generation_validation_attempts` beanspruchen, erneut von Luna prüfen – mit derselben Strenge wie Versuch 1.
6. `pass` → Bild speichern und liefern, `generation_metadata.repair = { attempt, mask, instruction, promptStrength }`. `fail` → Kandidat verworfen; Seed-Wiederholung wie heute.

Maximal **eine Reparatur pro Kandidat**, damit Kosten und Wartezeit begrenzt bleiben: eine Reparatur kostet eine FLUX-Generierung plus eine Luna-Prüfung, also rund 20 + 10 Sekunden.

## 3. Voraussetzung: Bildregionen vom Validator

Heute liefert das Inventar nur Text („sink: island, right side"). Für Masken braucht jeder Eintrag eine Box. Erweiterung von `validator-v2` auf `validator-v3`:

- Inventar-Eintrag erhält `box: [x0, y0, x1, y1]` in Promille der Bildmaße (0–1000), wie es Gemini und die GPT-Modelle nativ ausgeben.
- Parser prüft Plausibilität (innerhalb des Bildes, Fläche > 0, nicht das ganze Bild) und verwirft unplausible Boxen; ein Eintrag ohne brauchbare Box bleibt zählbar, aber nicht reparierbar.
- Boxen werden im Bericht gespeichert und auf `/quality-gate` als Overlay über dem Bild gezeichnet, damit ihre Genauigkeit von Hand beurteilt werden kann.

**Messung vor dem Bau der Reparatur:** die 30 Batch-Bilder mit `validator-v3` erneut bewerten und die Boxen im Review-Overlay prüfen. Kriterium: Bei mindestens 9 von 10 Dubletten liegt die Box auf der richtigen Vorrichtung und deckt sie vollständig ab. Sonst zuerst die Box-Anweisung nachschärfen; ohne verlässliche Boxen gibt es kein Inpainting.

## 4. Kalibrierung der Reparatur

Mit dem Batch-Harness: 10 Bilder mit bekannter Dublette × 3 Werte für `prompt_strength` (0,7 / 0,85 / 1,0) × 2 Maskenränder. Bewertet wird zweifach: Luna-Urteil nach Reparatur (ist die Dublette weg, ist nichts Neues entstanden?) und Handprüfung der Identität (Front, Griffe, Übergang der Arbeitsplatte an der Maskenkante). Gewählt wird die Einstellung mit den meisten bestandenen Zweitprüfungen ohne sichtbare Nahtstellen.

## 5. Änderungen im Code (Umfang: mittel)

- `lib/visionValidator.ts`: Box im Inventar (Anweisung, Typ, Parser, Plausibilität), `VALIDATOR_PROMPT_VERSION` → `validator-v3`.
- `lib/repair.ts` (neu): Triage (`isRepairable(report)`), Maskenerzeugung aus Boxen (serverseitig, z. B. mit `sharp` – Abhängigkeit prüfen), Inpainting-Aufruf mit dem LoRA-Modell, Upload.
- `lib/qualityGate.ts`: `runRepairAttempt` = Reparatur + Claim von Versuch 2 + Prüfung.
- `app/api/replicate/status/route.ts`: Im Enforce-Zweig bei `fail` und reparabel: Reparatur per `after()` starten, Antwort `repairing`; Folgepolls lesen Versuch 2. Neuer Ladetext „Bild wird korrigiert …".
- `components/QualityGateReview.tsx`: Box-Overlay, Versuch 1 und 2 nebeneinander, Reparaturparameter sichtbar.
- Schalter `QUALITY_GATE_REPAIR=off|on` (Standard `off`, bis Abschnitt 3 und 4 bestanden sind).
- Keine Migration: `attempt_number` 2 existiert bereits, Reparaturdaten liegen im Bericht und in `generation_metadata`.

## 6. Grenzen und Risiken

- **Reproduzierbarkeit** sinkt: Ein repariertes Bild entsteht aus Prompt, Seed *und* Maske. Deshalb werden Maske, Anweisung und Stärke gespeichert.
- **Nahtstellen:** Inpainting kann an der Maskenkante Farb- oder Musterbrüche in der Arbeitsplatte erzeugen; Rand und `prompt_strength` sind dafür da, die Handprüfung entscheidet.
- **Falsche Box, falsche Reparatur:** Trifft die Box das richtige Becken statt der Dublette, ist das Bild danach falsch. Darum die Box-Messung vor dem Bau und die Zweitprüfung danach.
- **Kein Hebel für die Inselaufteilung** – den größten Fehlerblock adressiert nur Nachtraining. Inpainting ist die Ergänzung für Dubletten, nicht der Ersatz.

## 7. Reihenfolge

1. `validator-v3` mit Boxen, Overlay im Review, Messung an den 30 Batch-Bildern.
2. Bei tauglichen Boxen: `lib/repair.ts` und Kalibrierung mit dem Harness (Abschnitt 4).
3. Einbau in die Status-Route hinter `QUALITY_GATE_REPAIR`, zunächst nur lokal und im Shadow Mode beobachten (Reparatur ausführen und prüfen, aber weiterhin nicht liefern).
4. Einschalten im Enforce-Modus, wenn die Zweitprüfung in der Beobachtung verlässlich besteht.

## 8. Offene Entscheidungen

- Soll ein *fehlendes* Kochfeld überhaupt per Inpainting ergänzt werden, oder nur Dubletten entfernt? (Ergänzen ist schwerer: die Region ist nicht durch eine Box gegeben.)
- Wie viel Wartezeit ist eine Reparatur wert – rund 30 s zusätzlich sind akzeptabel, wenn die Alternative die Fehlschlag-Meldung ist?
- Sollen reparierte Bilder in der Galerie erkennbar sein (intern ja, für Nutzer vermutlich nein)?
- Fremdeditor als Fallback zulassen, wenn die LoRA-Reparatur scheitert – und wenn ja, mit `handle_kind` und Frontfarbe als harten Checks?
