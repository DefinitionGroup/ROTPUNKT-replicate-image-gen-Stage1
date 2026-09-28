# Plan: „Bestes von zwei“ – Kandidatenauswahl im Qualitäts-Gate

**Status:** Plan, nicht umgesetzt (3. September 2026)
**Baut auf:** `playbook-stabilisierung.md`, Abschnitt 2d (Enforce-Modus mit parallelen Kandidaten)
**Ziel:** Wenn mehrere Kandidaten die harten Regeln erfüllen, das *bessere* Bild ausliefern statt das *erste*.

## 1. Ist-Zustand (umgesetzt)

Im Enforce-Modus erzeugt ein Auftrag `QUALITY_GATE_CANDIDATES` Kandidaten parallel (Standard 2, maximal 3) mit fortlaufenden Seeds. Jeder fertige Kandidat wird von Luna geprüft. **Der erste Kandidat, der die harten Regeln erfüllt, wird ausgeliefert; noch laufende Kandidaten werden abgebrochen.** Bestehen zwei Kandidaten im selben Poll, gewinnt der niedrigere Index. Es findet kein Vergleich statt.

In Phase 1 (`QUALITY_GATE_STRICTNESS=counts`) sind nur Raumtyp und die Zählungen hart. Spülen-Ort, Kochfeld-Ort, Inselanzahl, Armaturenausrichtung, Kameraführung und Grifftyp werden zwar geprüft und im Bericht gespeichert, entscheiden aber nicht. Genau diese Information liegt für jeden bestandenen Kandidaten ungenutzt vor – sie ist die Grundlage für „bestes von zwei“.

## 2. Soll-Zustand

Ein neuer Auswahlmodus `QUALITY_GATE_SELECTION`:

| Wert | Verhalten |
|---|---|
| `first` (heutiger Stand, bleibt Standard) | Erster bestandener Kandidat wird geliefert, Rest abgebrochen. |
| `best` (dieser Plan) | Alle Kandidaten werden abgewartet und geprüft; unter den bestandenen wird der mit der besten Bewertung geliefert. |

### Bewertung eines bestandenen Kandidaten

Nur Kandidaten mit hartem `pass` sind wählbar. Unter ihnen zählt ein **Fehlerscore** aus den weichen Checks; niedriger ist besser:

| Weicher Check | Gewicht | Begründung |
|---|---|---|
| `sink_location` falsch | 3 | Nutzerwahl sichtbar verletzt; häufigster FLUX-Fehler |
| `cooktop_location` falsch | 3 | wie oben |
| `island_count` falsch | 3 | Layout falsch (Insel fehlt oder zusätzlich) |
| `handle_kind` falsch | 2 | Produktidentität; für Rotpunkt sichtbar relevant |
| `camera_mode` falsch | 2 | z. B. Augenhöhe statt Vogelperspektive |
| `faucet_orientation` falsch | 1 | Detail |
| `handle_containment` falsch | 1 | Detail |
| Check `unklar` (passed = null) | halbes Gewicht | Unsicherheit wird milder gewertet als ein klarer Fehler |

Gleichstand: höhere Luna-Konfidenz gewinnt; danach der niedrigere Kandidatenindex (kleinster Seed), damit das Ergebnis deterministisch bleibt.

Die Gewichte stehen an einer Stelle im Code (`lib/qualityGate.ts`) und werden im Bericht des gewählten Kandidaten als `selection: { mode: "best", score, competitors: [...] }` gespeichert, damit jede Auswahl nachvollziehbar ist.

### Ablauf

1. Status-Route wie heute: fertige Kandidaten hochladen, Attempt-Zeile beanspruchen, Luna im Hintergrund.
2. Solange mindestens ein Kandidat noch generiert oder geprüft wird: `processing`, Phase `validating`, **kein** vorzeitiges Ausliefern.
3. Sind alle Kandidaten entschieden:
   - kein `pass` → `failed` mit `qualityFailure`, wie heute;
   - ein oder mehrere `pass` → Score berechnen, Gewinner als `images`-Zeile mit `qualityStatus: "accepted"` speichern und liefern. Die anderen bestandenen Kandidaten werden **nicht** gespeichert (kein zweites Bild in der Galerie); ihre Attempt-Zeilen bleiben mit Urteil und Score erhalten.
4. Fail-open bei Validator-Fehler bleibt: Ein Kandidat mit Verdict `error` gilt als wählbar mit dem schlechtesten Score, damit ein Ausfall nicht blockiert, aber ein sauber geprüfter Kandidat immer vorgeht.

## 3. Kosten und Zeit gegenüber `first`

- **Zeit:** Es wird immer auf den langsamsten Kandidaten plus dessen Prüfung gewartet. Erwartung: 35–45 s statt 30–35 s bis zum Bild (Generierung ~20 s parallel, Prüfung ~10 s je Kandidat, die Prüfungen laufen parallel).
- **Kosten:** Immer N Generierungen und N Prüfungen; der Abbruch des zweiten Kandidaten entfällt. Bei zwei Kandidaten also fest 2 × FLUX + 2 × Luna pro Auftrag, statt 1–2 × FLUX und 1–2 × Luna.
- **Nutzen:** Bei den 30 Batch-Bildern hätte `best` gegenüber `first` in geschätzt jedem dritten Inselauftrag ein Bild mit richtig platzierter Spüle und Kochfeld statt eines falsch platzierten geliefert (Abschätzung aus den Luna-Berichten; genaue Zahl folgt aus der Messung in Abschnitt 5).

## 4. Änderungen im Code (Umfang: klein bis mittel)

- `lib/qualityGate.ts`: `getQualityGateSelection()`, Scoring-Funktion `scoreAcceptedCandidate(report)` mit den Gewichten aus Abschnitt 2, `readValidationAttempt` liefert zusätzlich Bericht und Konfidenz.
- `app/api/replicate/status/route.ts`: Aggregation im Enforce-Zweig um den Modus `best` erweitern – auf alle Kandidaten warten, Gewinner bestimmen, nur ihn persistieren, kein Abbruch laufender Vorhersagen. Der `first`-Zweig bleibt unverändert.
- `components/wizard/ImageGenerator.tsx`: keine Änderung nötig; `phase: "validating"` und `quality.status: "accepted"` werden bereits verarbeitet. Optional ein zweiter Ladetext „Zwei Varianten werden verglichen …“.
- `components/QualityGateReview.tsx`: Score und „gewählt / nicht gewählt“ pro Kandidat anzeigen.
- `scripts/audit-flux1-v3-prompts.ts`: Tests für Scoring, Gleichstand und Fail-open-Rangfolge.
- `.env.local.example`, `playbook-stabilisierung.md` Abschnitt 2d: neuer Schalter dokumentiert.

Keine Datenbankmigration nötig: Score und Auswahl liegen im `report`-JSON der Attempt-Zeile.

## 5. Messung vor dem Umschalten

Mit dem vorhandenen Batch-Harness 30 Inselaufträge mit zwei Kandidaten erzeugen, alle Kandidaten mit `full` prüfen und offline beide Strategien simulieren: Wie oft wählt `best` einen Kandidaten mit richtiger Platzierung, den `first` verpasst hätte? Wie oft wählt `best` schlechter (z. B. weil Luna den Ort falsch liest, siehe den wahrscheinlichen Fehlurteil bei Satz `43cab866`)? Erst wenn `best` messbar öfter richtig als falsch umentscheidet, wird `QUALITY_GATE_SELECTION=best` empfohlen.

## 6. Entscheidungen

Alle Entscheidungen getroffen am 3. September 2026:

1. **Gewichte:** Kochfeld-Ort wiegt schwerer als Grifftyp. Die Gewichte aus Abschnitt 2 bleiben: Platzierung (Spüle, Kochfeld, Insel) je 3, Grifftyp und Kamera je 2, Details je 1.
2. **Abbruchkriterium:** `best` wartet immer auf alle Kandidaten, auch bei dreien. Kein Sonderfall „zwei bestanden reicht“.
3. **Nicht gewählte, bestandene Kandidaten:** Der Nutzer sieht sie nicht. Sie werden aber als `images`-Zeile gespeichert und dem **Admin-Konto** zugeordnet (`user_id` = `QUALITY_GATE_ARCHIVE_USER_ID`, eine Clerk-ID aus der Admin-Allowlist), mit `generation_metadata.qualityStatus: "accepted"` und `selection: "not_selected"` sowie Verweis auf den Auftrag über `generation_set_id`. Damit landen sie in der Galerie des Admins und bleiben für Vergleich und Testsatz verfügbar, ohne den Nutzer zu verwirren. Ist keine Archiv-ID konfiguriert, werden sie verworfen (Datei bleibt bis zur Löschfrist in MinIO, Attempt-Zeile bleibt immer).
4. **Umschalten auf `full`:** nach Messung im Shadow Mode, nicht nach Gefühl. Zwei Bedingungen: Luna liegt bei der Ortsbewertung in der menschlichen Markierung praktisch nie falsch (Warnfall: Satz `43cab866`), *und* die Platzierungstreue ist durch Reparatur oder Nachtraining so hoch, dass `full` mit zwei Kandidaten in deutlich mehr als der Hälfte der Inselaufträge ein Bild liefert.

Ergänzung zu Abschnitt 4 aus Entscheidung 3: `.env.local.example` erhält `QUALITY_GATE_ARCHIVE_USER_ID`; die Status-Route schreibt nicht gewählte Kandidaten mit dieser `user_id`. Da `images.candidate_index` pro Satz eindeutig ist, kollidiert das nicht mit dem gelieferten Bild. Die RLS-Policy `images_select_own` sorgt dafür, dass nur das Admin-Konto sie sieht.
