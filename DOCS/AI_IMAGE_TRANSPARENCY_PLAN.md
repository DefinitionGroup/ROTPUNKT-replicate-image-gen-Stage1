# Fahrplan zur Kennzeichnung KI-generierter Bilder

Stand: 1. August 2026
Status: Phase 1 ist auf `codex/ai-image-ui-label` umgesetzt und geprüft

## Ziel

Alle mit Rotpunkt Visions erzeugten oder hochskalierten Bilder sollen für Benutzer klar als KI-generierte Visualisierungen erkennbar sein. Die Kennzeichnung soll verständlich, barrierearm, zweisprachig und später auch außerhalb der Webapp dauerhaft nachweisbar sein.

Dieser Fahrplan ist eine technische Compliance-Empfehlung und keine Rechtsberatung. Die finale rechtliche Abnahme sollte durch eine auf den EU AI Act spezialisierte Stelle erfolgen.

## Rechtlicher Ausgangspunkt

- Die Transparenzpflichten aus Artikel 50 des EU AI Act gelten ab dem 2. August 2026.
- Für vollständig KI-generierte Inhalte stellt die EU-Kommission freiwillige offizielle Kennzeichnungs-Icons bereit. Die Kennzeichnung mit Icon und Klartext ist für Benutzer verständlicher als ein Icon allein.
- Die sichtbare UI-Kennzeichnung ersetzt keine maschinenlesbare Kennzeichnung der Bilddatei und bleibt nicht erhalten, wenn eine Bild-URL direkt geöffnet, heruntergeladen oder außerhalb der App geteilt wird.

Offizielle Quellen:

- [Artikel 50 EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
- [EU-Icons zur Kennzeichnung KI-generierter Inhalte](https://digital-strategy.ec.europa.eu/en/policies/eu-icons-labelling-ai-generated-content)
- [C2PA-Spezifikation](https://c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html)

## Phasen und Status

| Phase | Inhalt | Status |
| --- | --- | --- |
| 1 | Sichtbare Kennzeichnung in der Webapp | Umgesetzt und geprüft |
| 2 | Dauerhafte Kennzeichnung bei Download und Share | Geplant |
| 3 | Maschinenlesbare Provenienz mit C2PA | Geplant |
| 4 | Audit-Metadaten in Supabase | Geplant |
| 5 | Rechtliche Abnahme, Monitoring und Governance | Geplant |

## Phase 1: Sichtbare Kennzeichnung in der Webapp

### Umsetzung

- Offizielles EU-Icon für vollständig KI-generierte Inhalte als unverändertes SVG-Asset einbinden.
- Mit lokalisiertem Klartext kombinieren:
  - Deutsch: „KI-generierte Visualisierung“
  - Englisch: „AI-generated visualisation“
- Ergänzende Erklärung über den zugänglichen Namen und die native Detailanzeige:
  - Deutsch: „Diese Visualisierung wurde vollständig mit KI erzeugt. Materialien, Farben, Proportionen und Produktdetails können von realen Ausführungen abweichen.“
  - Englisch: „This visualisation was generated entirely with AI. Materials, colours, proportions and product details may differ from real products.“
- Kennzeichnung an allen relevanten Bildansichten:
  - Ergebnisvergleich der drei Varianten
  - Galerie „Meine Bilder“
  - Vollbild-/Detailmodal
  - Upscale-Ergebnis
- Das wiederverwendbare UI-Element erhält ausreichenden Kontrast, einen zugänglichen Namen und bleibt auf Desktop und Mobile lesbar.

### Abnahmekriterien

- Die Kennzeichnung ist beim ersten Anzeigen der generierten Ergebnisse sichtbar, ohne dass der Benutzer interagieren muss.
- In Galerie, Detailmodal und Upscale-Ergebnis ist jedes Bild eindeutig zugeordnet gekennzeichnet.
- Deutsche und englische Texte werden über `next-intl` ausgeliefert.
- Das Icon stammt aus dem offiziellen EU-Download und wird nicht grafisch verändert.
- TypeScript-Prüfung, gezielter Lint aller geänderten Quellcodedateien, Produktions-Build und erreichbare Browserzustände sind fehlerfrei.

Hinweis zur Repository-QA: Der globale Befehl `pnpm lint` erfasst aktuell auch den generierten `.next`-Ordner und schlägt zusätzlich an bereits bestehenden, von dieser Phase unabhängigen Quellcodefehlern an. Diese Konfiguration sollte separat bereinigt werden; sie ist kein durch Phase 1 verursachter Fehler.

### Verbleibendes Risiko nach Phase 1

Phase 1 kennzeichnet die Darstellung in der Webapp, nicht die zugrunde liegende Datei. Direkte MinIO-URLs, bestehende Downloads, native Shares und extern eingebettete Bilder tragen die Kennzeichnung nicht automatisch. Phase 1 ist deshalb eine sofortige Teilmaßnahme, aber noch keine vollständige Ende-zu-Ende-Lösung.

## Phase 2: Kennzeichnung bei Download und Share

- Für Downloads eine öffentliche Ableitung mit dauerhaft sichtbarer Kennzeichnung erzeugen.
- Das unveränderte Original als internes Master beibehalten, sofern dafür ein berechtigter Produktzweck besteht.
- Share-Funktionen auf eine gekennzeichnete öffentliche Datei oder eine gekennzeichnete Landingpage umstellen.
- Bereits gespeicherte Bilder bei Download serverseitig kennzeichnen oder gekennzeichnete Derivate nachträglich erzeugen.
- Dateiname und Metadaten mit einem eindeutigen AI-Hinweis ergänzen.

Abnahme: Eine außerhalb der App geöffnete heruntergeladene oder geteilte Datei bleibt als KI-generiert erkennbar.

## Phase 3: Maschinenlesbare Provenienz

- C2PA Content Credentials serverseitig evaluieren und signieren.
- Manifest mit Erzeugungszeitpunkt, verwendetem Modell, Bearbeitungsschritten und Rotpunkt als ausstellender Anwendung erstellen.
- Signaturschlüssel getrennt von der Webapp verwalten und rotierbar machen.
- Prüfen, ob MinIO/CDN, Upscaling und weitere Bildtransformationen das Manifest erhalten.
- Fallback-Metadaten nutzen, falls ein Zielsystem C2PA entfernt; sichtbare Kennzeichnung bleibt davon unabhängig.

Abnahme: Eine unabhängige C2PA-Prüfung kann Herkunft und Unversehrtheit der ausgelieferten Datei bestätigen.

## Phase 4: Audit-Metadaten in Supabase

Additive, nullable Felder beziehungsweise ein separates Audit-Objekt vorsehen, ohne bestehende Bilder oder Konten zu verändern:

- Kennzeichnungsstatus und Version der Kennzeichnungsrichtlinie
- Typ der Erzeugung: generiert oder hochskaliert
- Modell, LoRA-Version/-Gewicht und Generation-Set-ID
- Zeitpunkt der Erzeugung und Zeitpunkt der Kennzeichnung
- URL beziehungsweise Objekt-Key von Master und öffentlicher Ableitung
- C2PA-Manifest-ID und Signaturstatus

Vor einer Migration: SQL separat prüfen, Backup-Stand bestätigen, Staging anwenden und Rückwärtskompatibilität mit alten `NULL`-Zeilen testen.

## Phase 5: Governance und Betrieb

- Juristische Abnahme der Texte und der Einordnung der konkreten Bilder unter Artikel 50.
- Verantwortlichkeiten für Kennzeichnungsrichtlinie, Schlüsselverwaltung und Incident Response festlegen.
- Monitoring für fehlende Kennzeichnungen, fehlerhafte Derivate und ungültige C2PA-Signaturen einführen.
- Vierteljährliche Prüfung auf neue Leitlinien, Standards und Änderungen der EU-Kommission.
- Nutzerfeedback und Fehlermeldungen zur Kennzeichnung dokumentieren.

## Empfohlene Reihenfolge

1. Phase 1 jetzt ausrollen.
2. Innerhalb des nächsten Sprints Download und Share auf gekennzeichnete Derivate umstellen.
3. Parallel einen C2PA-Prototyp an einer vollständigen Generate-Upscale-Download-Kette testen.
4. Erst nach bestätigtem Datenmodell eine additive Supabase-Migration ausrollen.
5. Die technische und rechtliche Ende-zu-Ende-Abnahme nach Phase 1 unverzüglich terminieren.

## Asset-Provenienz

- Asset: offizielles EU-Label „AI GENERATED“ für vollständig KI-generierte Inhalte
- Format: SVG, schwarze Variante
- Quelle: EU-Kommission, Seite „EU icons for labelling AI-generated content“
- Abrufdatum: 1. August 2026
- Lokaler Zielpfad: `public/UI/eu-ai-generated.svg`
