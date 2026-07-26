# Prompt Geometry Improvement Plan

## Ziel

Die Bildgenerierung soll Küchen mit genau einer plausiblen Spülen-/Armaturenzone erzeugen und ausgewählte Griffsysteme eindeutig, kollisionsfrei und innerhalb der jeweiligen Tür- oder Schubladenfront montieren.

## Festgestellte Ursachen

1. Die aktive V2-Prompt-Pipeline beschreibt Griffgeometrie, Montagepunkte und Frontgrenzen nicht verbindlich.
2. Einzelne Griff-Captions enthalten Mengen- und Szeneninformationen wie `multiple handles`, `four handles visible`, Frontfarben oder Arbeitsplatten.
3. Tokyo-Varianten beschreiben überwiegend Material und Farbe, nicht das charakteristische gefräste Griffprofil.
4. `handleless` und `tokyo_grip` werden im Modell-Prompt fälschlich als allgemeine `Handle hardware` behandelt.
5. Die Wasserzone wird spät und nur als Objektanzahl beschrieben; ihre Position und die Funktion der übrigen Arbeitsflächen bleiben offen.
6. Die Replicate-Route verwendet Eingabefelder, die im Schema der aktiven Modellversion nicht definiert sind.

## Umsetzung

### 1. Konstruktive Prompt-Topologie

- Die Wasserzone direkt hinter der Szeneneinleitung platzieren.
- Eine einzelne, räumlich definierte Nasszone beschreiben: ein Becken und eine Mischarmatur auf der rückwärtigen Arbeitsfläche.
- Inseln, Halbinseln und übrige Arbeitsflächen positiv als durchgehende, trockene Vorbereitungsflächen definieren.
- Die Regel in Detailaufnahmen auslassen, damit Armaturen nicht unnötig in Griff-Makros gezogen werden.

### 2. Griffartspezifische Prompt-Profile

- `handleless`: unterbrochene Begriffe wie `handle hardware` vermeiden; ausschließlich das integrierte Öffnungssystem beschreiben.
- `tokyo_grip`: gefrästes Profil, überstehende Lippe und Fingervertiefung erklären; je Front ein separates Profil mit sichtbarer Fuge.
- `t_bar`: ein zentraler Sockel bzw. eine Rückplatte vollständig innerhalb einer einzelnen Front.
- `bar_pull`: beide Montagefüße innerhalb derselben Front; Griffenden vor den Frontkanten; freie Fuge zwischen Nachbarfronten.
- `knob`: ein einzelner Montagepunkt innerhalb einer Front.
- Generischer Fallback: vollständige Montage innerhalb einer einzelnen bedienbaren Front.

### 3. Caption-Bereinigung

- Mengenangaben und fotografische Szenenbeschreibungen entfernen bzw. singularisieren.
- Fremde Frontfarben, Arbeitsplatten, Beleuchtung und Perspektiven aus Griff-Captions entfernen.
- Produktgeometrie, Textur und Finish beibehalten.

### 4. Replicate-Konfiguration

- `guidance` durch `guidance_scale` ersetzen.
- Nicht unterstützte Felder `image_size` und `enhance_prompt` entfernen.
- `megapixels: "1"` explizit setzen.
- Für FLUX dev die dokumentierten 28 Inferenzschritte verwenden.
- LoRA-Stärke vorerst beibehalten; eine Änderung erfolgt erst nach einem Seed-kontrollierten Bildvergleich.

### 5. Verifikation

- TypeScript/ESLint und Produktions-Build ausführen.
- Repräsentative Prompts für `handleless`, `tokyo_grip`, `t_bar` und `bar_pull` erzeugen und textuell prüfen.
- Sicherstellen, dass Modell-Prompts keine problematischen Mengen-Captions enthalten.
- Keine kostenpflichtigen Replicate-Generierungen automatisch starten. Für einen visuellen A/B-Test anschließend feste Seeds und identische Konfigurationen verwenden.

## Abnahmekriterien

- Die Wasserzonenregel steht vor Licht-, Kamera- und Dekor-Anweisungen.
- Jeder Griff-Prompt beschreibt Montage innerhalb genau einer Front und eine sichtbare, freie Fuge.
- Tokyo enthält die trainierte Profilgeometrie statt ausschließlich Material/Farbe.
- Grifflos enthält keinen widersprüchlichen `Handle hardware`-Präfix.
- `multiple handles` und `four handles visible` erreichen den Modell-Prompt nicht.
- Die Replicate-Inputs entsprechen dem Live-Schema der aktiven Modellversion.
