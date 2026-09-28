# Rotpunkt Visions – Inhalte (Demo)

Diese Datei ist die Inhaltsquelle, solange `DEV_CONTENT=true` gesetzt ist. Später wandern
dieselben Felder nach Sanity; das Modell dahinter ist `lib/content/types.ts`.

Pro Sprache steht unter `## de` bzw. `## en` genau ein `yaml`-Block. Alles außerhalb der
Blöcke ist Kommentar. Headlines markieren das eine kursive Serif-Wort mit *Sternchen*.

**Herkunft der Texte.** Alle Texte der bisherigen Sanity-Seiten (Home de/en, Über uns,
Impressum, Datenschutz, Navigation, Footer, Bildergalerie) sind unverändert übernommen.
Neu formuliert – und deshalb als **Vorschlag** zu lesen – sind die Homepage-Abschnitte
`promises` (die vier Zusagen), `studio` (der Konfigurator-Teaser) und `closing`, sowie die
Hero-Headline, die aus der bisherigen Unterzeile „Von der Vorstellung zur Inspiration." entsteht.

## de

```yaml
nav:
  items:
    - { label: "Startseite", href: "/" }
    - { label: "Unser Design", href: "/ueber-uns" }
    - { label: "Rotpunktkuechen.de", href: "https://www.rotpunktkuechen.de/", external: true }
  cta: { label: "Küche visualisieren", href: "/studio" }

footer:
  columns:
    - title: "Links"
      links:
        - { label: "Datenschutz", href: "/datenschutzerklaerung" }
        - { label: "Impressum", href: "/disclaimer" }
        - { label: "Rotpunkt Website", href: "https://www.rotpunktkuechen.de/", external: true }
  copyright: "2026 © Rotpunkt Küchen"
  note: "Gefertigt in Deutschland"

home:
  hero:
    eyebrow: "Inspirationen"
    title: "Von der Vorstellung zur *Inspiration*."
    subline: "Hören Sie auf zu träumen, fangen Sie an zu sehen. Beschreiben Sie die Küche, die Sie sich immer gewünscht haben – unsere KI erschafft eine Visualisierung im unverwechselbaren Rotpunkt Stil."
    cta: { label: "Küche visualisieren", href: "/studio" }
    filmLabel: "Den Film ansehen"
    badge: "Gefertigt in Deutschland"
    video:
      src: "/video/hero-loop.mp4"
      poster: "/video/hero-poster.jpg"

  manifest:
    label: "Inspirationen"
    statement:
      - { text: "Hören Sie auf zu träumen, fangen Sie an zu" }
      - { text: "sehen.", serif: true }
    paragraphs:
      - "Beschreiben Sie die Küche, die Sie sich immer gewünscht haben – von den Materialien bis zur Atmosphäre – und unsere KI erschafft eine wunderschöne, hochwertige Visualisierung im unverwechselbaren Rotpunkt Stil."
      - "Speichern Sie Ihre Lieblingsentwürfe, teilen Sie sie mit Ihrer Familie und machen Sie den ersten konkreten Schritt, um Ihre Traumküche Wirklichkeit werden zu lassen."
    image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968553/high-res-image-1771543375441_tide3z.png"
    alt: "Dunkle Stilkücheninsel mit Messinggriffen und LED-Beleuchtung"
    caption: "Visualisierung im Rotpunkt Stil – dunkle Insel, Messing, Abendlicht"
    cta: { label: "Die vier Zusagen", href: "#zusagen" }

  promises:
    label: "Rotpunkt Visions"
    title: "Vier Zusagen. Ein *Bild*."
    intro: "Kein generischer Bildgenerator. Jede Visualisierung entsteht aus echten Rotpunkt-Fronten und -Griffen, aus Ihrer Aufteilung – und wird geprüft, bevor Sie sie sehen."
    items:
      - id: "fronten"
        label: "Material"
        title: "Echte Rotpunkt-Fronten"
        body: "Frontfarben aus dem Katalog und FENIX-Oberflächen, wie sie später in Ihrer Küche stehen."
        detail:
          - "Die Visualisierung kennt die Rotpunkt-Fronten im Original: Lack, Holz, matte Kunststoff- und Metallfronten aus dem Frontfarben-Katalog sowie die FENIX-Farbwelt mit ihrer super-matten, weichen Oberfläche."
          - "Was Sie auswählen, ist die Front, die Rotpunkt fertigt – mit Farbton, Material und Glanzgrad."
      - id: "griffe"
        label: "Griffe"
        title: "Griffe im Original"
        body: "Grifflos, Tokyo-Profil, Buster & Punch oder klassischer Bügel – jede Geometrie sitzt an ihrem Platz."
        detail:
          - "Jeder Grifftyp hat seine eigene Montageregel: ein Knopf mit einem Punkt, ein Bügel mit zwei Füßen auf derselben Front, das Tokyo-Profil als durchlaufende Kante. Die Visualisierung hält diese Regeln ein, statt Griffe frei zu erfinden."
      - id: "aufteilung"
        label: "Aufteilung"
        title: "Ihre Aufteilung"
        body: "Küchenzeile, über Eck oder mit Insel – Sie legen fest, wo Spüle und Kochfeld sitzen."
        detail:
          - "Bei einer Inselküche entscheiden Sie, ob Spüle und Kochfeld an der Wand oder auf der Insel liegen. Genau diese Aufteilung ist Teil der Vorgabe an die Bildgenerierung und wird anschließend geprüft."
      - id: "pruefung"
        label: "Qualität"
        title: "Geprüfte Bilder"
        body: "Ein Prüfmodell kontrolliert Spüle, Armatur, Kochfeld und Perspektive, bevor ein Bild erscheint."
        detail:
          - "Bildgeneratoren erfinden gern eine zweite Armatur oder ein zweites Becken. Deshalb prüft ein zweites Modell jede Visualisierung gegen Ihre Vorgaben: genau eine Spüle, genau eine Armatur, ein Kochfeld, die gewählte Perspektive."
          - "Besteht ein Bild die Prüfung nicht, wird es nicht gezeigt – Sie erhalten stattdessen eine neue Variante."
    cta: { label: "Küche visualisieren", href: "/studio" }

  gallery:
    label: "Galerie"
    title: "Aus dem *Studio*."
    intro: "Sechs Visualisierungen, wie Nutzerinnen und Nutzer sie erzeugt haben – jede aus einer eigenen Konfiguration."
    items:
      - title: "Schwarze Küche auf einer Mittelmeerinsel."
        description: "Im Abendrot und Sonnenuntergang. Elegant und modern."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1755780787/tmpfzpy88xv_tiaete.jpg"
      - title: "Minimalistische helle Kücheninsel."
        description: "Vor großer Fensterfront mit Gebirge im Hintergrund."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968455/223-ecd09168-0255-4e1e-9d01-0c9e25f8d947_nr9ruq.png"
      - title: "Dunkle Stilkücheninsel mit Messinggriffen."
        description: "LED-Beleuchtung im Hintergrund, Deckenlampen und Frühstückstisch."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968553/high-res-image-1771543375441_tide3z.png"
      - title: "Moderne Küche. Eckform."
        description: "Mit Accessoires und Frühstückstisch."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968651/high-res-image-1771581854372_q7vhzp.png"
      - title: "Nachtimpression für die Luxusküche auf der Terrasse."
        description: "Visualisierung im Rotpunkt Stil."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968771/38fe550e-c5f9-457a-bc33-db9ae223c10d-1337-3b82eb30-0b78-11f1-81c6-8211398b70a4_lpiz2w.png"
      - title: "Kücheninsel im Ferienstudio."
        description: "Minimalistisch für kleine Ferienträume."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968938/229-f5ccee15-6cd8-4474-a3c6-553aec6698a2_u7133h.png"
    cta: { label: "Design mit Wirkung.", href: "/ueber-uns" }

  studio:
    label: "Konfigurator"
    title: "Acht Entscheidungen. Ein *Bild*."
    body: "Umgebung, Raum, Farbwelt, Griff, Atmosphäre, Boden, Accessoires und Ihre Wünsche – geführt, Schritt für Schritt. Das Bild entsteht in unter einer Minute und wird geprüft, bevor Sie es sehen."
    image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968771/38fe550e-c5f9-457a-bc33-db9ae223c10d-1337-3b82eb30-0b78-11f1-81c6-8211398b70a4_lpiz2w.png"
    alt: "Nachtimpression einer Luxusküche auf der Terrasse"
    stages:
      - { id: "raum", label: "Raum", title: "Raum und Aufteilung", body: "Umgebung, Küchenform, Spüle und Kochfeld." }
      - { id: "material", label: "Material", title: "Fronten und Griffe", body: "Frontfarben, FENIX und der Griff im Original." }
      - { id: "atmosphaere", label: "Atmosphäre", title: "Stil, Perspektive, Licht", body: "Vom Loft bis zum Landhaus, von Augenhöhe bis Vogelperspektive." }
    steps:
      - { label: "Konfigurieren", title: "Acht Schritte", body: "Jede Auswahl ist eine Karte – Bild statt Fachbegriff." }
      - { label: "Erzeugen", title: "Unter einer Minute", body: "Die KI rendert im Rotpunkt Stil, mit Ihren Fronten und Griffen." }
      - { label: "Prüfen", title: "Bevor Sie es sehen", body: "Ein Prüfmodell kontrolliert Spüle, Kochfeld und Perspektive." }
      - { label: "Behalten", title: "Ihre Galerie", body: "Speichern, hochskalieren, teilen – und zum Händler mitnehmen." }
    cta: { label: "Jetzt visualisieren", href: "/studio" }
    explainerLabel: "So funktioniert es"
    explainerTitle: "Vier *Schritte*."
    explainerIntro: "Von der ersten Auswahl bis zum geprüften Bild – in Ihrem Tempo, mit Anmeldung erst beim Erzeugen."
    note: "Anmeldung über Google oder E-Mail erst beim Erzeugen."

  closing:
    title: "Fangen Sie an zu *sehen*."
    body: "Konfigurieren Sie als Gast, melden Sie sich zum Erzeugen an – Ihre Visualisierungen bleiben in Ihrer Galerie und sind nur einen Klick vom Händler entfernt."
    cta: { label: "Küche visualisieren", href: "/studio" }

pages:
  ueber-uns:
    slug: "ueber-uns"
    title: "Unser Design"
    kind: "about"
    translations: { de: "ueber-uns", en: "about-us" }
    hero:
      heading: "Unsere Ideen wachsen."
      subheading: "Für Sie und mit Ihnen."
      video: "https://res.cloudinary.com/dsuqmlyyl/video/upload/v1757589934/iStock-1459952878_suesser_kleiner_junge_bpfrpg.mp4"
      alt: "Child"
    headline:
      eyebrow: "Bei uns ist Standard alles andere als gewöhnlich."
      headline: "Innovation & *Design*."
      subhead: "Jede Küche wird mit höchster Sorgfalt gefertigt – stabil, langlebig und in einem Design, das bis ins Detail überzeugt. Außen wie innen perfekt aufeinander abgestimmt, mit hochwertigen Materialien und raffinierten Lösungen, die den Alltag leichter machen."
    cards:
      - title: "Außen wie innen perfekt aufeinander abgestimmt."
        description: "Qualität spürbar erleben"
        body: "Küchen sind ein Wohlfühlort für gemeinsame Stunden mit Familie und Freunden. Und das bedeutet, dass alles aufeinander abgestimmt werden muss. Ob es Ergonomie, Material oder Funktion ist. Das ist die Essenz von Design."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1757596789/csm_00_arbeitsplatten__2200_1375_db76226c09_vrcj2q.webp"
        cta: { label: "Rotpunkt", href: "https://www.rotpunktkuechen.de/", external: true }
      - title: "Design"
        description: "Design mit Emotionen"
        body: "Getrieben von der Leidenschaft, Küchen zu produzieren, die Herzen höherschlagen lassen, entwickeln wir von Rotpunkt Küchen uns seit über neun Jahrzehnten kontinuierlich weiter."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1757596789/csm_MK4C_A01_Verde-Kitami_02_NEU-EDIT_a59a684618_yff1lp.webp"
        cta: { label: "Rotpunkt", href: "https://www.rotpunktkuechen.de/", external: true }
      - title: "Küchen – über die Welt, in der wir leben"
        description: "Produkte mit Verantwortung"
        body: "Wir übernehmen Verantwortung: Unsere Fertigung ist klimafreundlich, die verwendeten Materialien nachhaltig und gesundheitsschonend. So genießen Sie nicht nur mehr Komfort, sondern auch ein gutes Gefühl."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1757596789/csm_Rotpunkt_MK6_header__2200x1375_da02e2eda8_ok1tuk.webp"
        cta: { label: "Rotpunkt", href: "https://www.rotpunktkuechen.de/", external: true }
      - title: "Individuell – wie die Menschen"
        description: "Details mit Mehrwert"
        body: "Individuell geplante Küchen. Wir bieten die komplette Palette an Küchenmodulen und Designs an, die eine Küche zu einem Zuhause machen."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1757596789/csm_00_kachel_RP_Griff_Bronze__W7A5033_02__2200_1375_70392ee396_gikoxr.webp"
        cta: { label: "Rotpunkt", href: "https://www.rotpunktkuechen.de/", external: true }

  disclaimer:
    slug: "disclaimer"
    title: "Impressum"
    kind: "legal"
    translations: { de: "disclaimer", en: "disclaimer" }
    markdown: |
      # Impressum

      **Rotpunkt Küchen GmbH**
      Ladestraße 52
      32257 Bünde
      Germany

      Postfach 2626
      32226 Bünde

      Tel.: +49 (0) 5223 6900-0
      Fax: +49 (0) 5223 6900-100
      E-Mail: info@rotpunktkuechen.de

      ### Handelsregister

      Amtsgericht Bad Oeynhausen, HRB 15361

      ### Vertretungsberechtigte Geschäftsführer

      Heinz-Jürgen Meyer, Andreas Wagner, Sven Herden

      ### Umsatzsteuer-Identifikationsnummer

      DE173456377

      ### Inhaltlich verantwortlich

      Andreas Wagner

      ### Konzeption, Gestaltung und Webentwicklung

      definiton.group Jever · Wilhelmshaven · Las Palmas
      [https://www.definition.studio](https://definition.studio)

      ### Haftungsausschluss

      **1. Inhalt des Onlineangebotes**

      Der Autor übernimmt keinerlei Gewähr für die Aktualität, Korrektheit, Vollständigkeit oder Qualität der bereitgestellten Informationen. Haftungsansprüche gegen den Autor, welche sich auf Schäden materieller oder ideeller Art beziehen, die durch die Nutzung oder Nichtnutzung der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und unvollständiger Informationen verursacht wurden sind grundsätzlich ausgeschlossen, sofern seitens des Autors kein nachweislich vorsätzliches oder grob fahrlässiges Verschulden vorliegt.

      Alle Angebote sind freibleibend und unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.

      **2. Verweise und Links**

      Bei direkten oder indirekten Verweisen auf fremde Internetseiten ("Links"), die außerhalb des Verantwortungsbereiches des Autors liegen, würde eine Haftungsverpflichtung ausschließlich in dem Fall in Kraft treten, in dem der Autor von den Inhalten Kenntnis hat und es ihm technisch möglich und zumutbar wäre, die Nutzung im Falle rechtswidriger Inhalte zu verhindern.

      Der Autor erklärt daher ausdrücklich, dass zum Zeitpunkt der Linksetzung die entsprechenden verlinkten Seiten frei von illegalen Inhalten waren. Der Autor hat keinerlei Einfluss auf die aktuelle und zukünftige Gestaltung und auf die Inhalte der gelinkten / verknüpften Seiten. Deshalb distanziert er sich hiermit ausdrücklich von allen Inhalten aller gelinkten / verknüpften Seiten, die nach der Linksetzung verändert wurden. Diese Feststellung gilt für alle innerhalb des eigenen Internetangebotes gesetzten Links und Verweise sowie für Fremdeinträge in vom Autor eingerichteten Gästebüchern, Diskussionsforen und Mailinglisten. Für illegale, fehlerhafte oder unvollständige Inhalte und insbesondere für Schäden, die aus der Nutzung oder Nichtnutzung solcherart dargebotener Informationen entstehen, haftet allein der Anbieter der Seite, auf welche verwiesen wurde, nicht derjenige, der über Links auf die jeweilige Veröffentlichung lediglich verweist.

      **3. Urheber- und Kennzeichenrecht**

      Der Autor ist bestrebt, in allen Publikationen die Urheberrechte der verwendeten Grafiken, Tondokumente, Videosequenzen und Texte zu beachten, von ihm selbst erstellte Grafiken, Tondokumente, Videosequenzen und Texte zu nutzen oder auf lizenzfreie Grafiken, Tondokumente, Videosequenzen und Texte zurückzugreifen.

      Alle innerhalb des Internetangebotes genannten und ggf. durch Dritte geschützten Marken- und Warenzeichen unterliegen uneingeschränkt den Bestimmungen des jeweils gültigen Kennzeichenrechts und den Besitzrechten der jeweiligen eingetragenen Eigentümer. Allein aufgrund der bloßen Nennung ist nicht der Schluss zu ziehen, dass Markenzeichen nicht durch Rechte Dritter geschützt sind! Das Copyright für veröffentlichte, vom Autor selbst erstellte Objekte bleibt allein beim Autor der Seiten. Eine Vervielfältigung oder Verwendung solcher Grafiken, Tondokumente, Videosequenzen und Texte in anderen elektronischen oder gedruckten Publikationen ist ohne ausdrückliche Zustimmung des Autors nicht gestattet.

      **4. Rechtswirksamkeit dieses Haftungsausschlusses**

      Dieser Haftungsausschluss ist als Teil des Internetangebotes zu betrachten, von dem aus auf diese Seite verwiesen wurde. Sofern Teile oder einzelne Formulierungen dieses Textes der geltenden Rechtslage nicht, nicht mehr oder nicht vollständig entsprechen sollten, bleiben die übrigen Teile des Dokumentes in ihrem Inhalt und ihrer Gültigkeit davon unberührt.

  datenschutzerklaerung:
    slug: "datenschutzerklaerung"
    title: "Datenschutz"
    kind: "legal"
    translations: { de: "datenschutzerklaerung" }
    markdown: |
      # Datenschutz

      ### 1. Datenschutz auf einen Blick

      ### Allgemeine Hinweise

      Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.

      ### Datenerfassung auf unserer Website

      ### Wer ist verantwortlich für die Datenerfassung auf dieser Website?

      Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.

      ### Wie erfassen wir Ihre Daten?

      Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.

      Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie unsere Website betreten.

      ### Wofür nutzen wir Ihre Daten?

      Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.

      ### Welche Rechte haben Sie bezüglich Ihrer Daten?

      Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.

      ### Analyse-Tools und Tools von Drittanbietern

      Beim Besuch unserer Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. Das geschieht vor allem mit Cookies und mit sogenannten Analyseprogrammen. Die Analyse Ihres Surf-Verhaltens erfolgt in der Regel anonym; das Surf-Verhalten kann nicht zu Ihnen zurückverfolgt werden. Sie können dieser Analyse widersprechen oder sie durch die Nichtbenutzung bestimmter Tools verhindern. Detaillierte Informationen dazu finden Sie in der folgenden Datenschutzerklärung.

      Sie können dieser Analyse widersprechen. Über die Widerspruchsmöglichkeiten werden wir Sie in dieser Datenschutzerklärung informieren.

      ### 2. Allgemeine Hinweise und Pflichtinformationen

      ### Datenschutz

      Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.

      Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.

      Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.

      ### Hinweis zur verantwortlichen Stelle

      Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:

      Rotpunkt Küchen GmbH

      Telefon: 05223- 69 00 0

      E-Mail: info@rotpunktkuechen.de

      Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.

      ### Widerruf Ihrer Einwilligung zur Datenverarbeitung

      Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.

      ### Beschwerderecht bei der zuständigen Aufsichtsbehörde

      Im Falle datenschutzrechtlicher Verstöße steht dem Betroffenen ein Beschwerderecht bei der zuständigen Aufsichtsbehöre zu:

      Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen

      Helga Block

      Kavalleriestraße 2-4

      40213 Düsseldorf

      Telefon: 02 11/384 24-0

      Telefax: 02 11/384 24-10

      ### Recht auf Datenübertragbarkeit

      Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die direkte Übertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch machbar ist.

      ### SSL- bzw. TLS-Verschlüsselung

      Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL-bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von “http://” auf “https://” wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.

      Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.

      ### Verschlüsselter Zahlungsverkehr auf dieser Website

      Besteht nach dem Abschluss eines kostenpflichtigen Vertrags eine Verpflichtung, uns Ihre Zahlungsdaten (z.B. Kontonummer bei Einzugsermächtigung) zu übermitteln, werden diese Daten zur Zahlungsabwicklung benötigt.

      Der Zahlungsverkehr über die gängigen Zahlungsmittel (Visa/MasterCard, Lastschriftverfahren) erfolgt ausschließlich über eine verschlüsselte SSL- bzw. TLS-Verbindung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem SchlossSymbol in Ihrer Browserzeile.

      Bei verschlüsselter Kommunikation können Ihre Zahlungsdaten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.

      ### Auskunft, Sperrung, Löschung

      Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.

      ### Widerspruch gegen Werbe-Mails

      Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen. Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-E-Mails, vor.

      ### 3. Datenerfassung auf unserer Website

      ### Cookies

      Die Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen. Cookies sind kleine Textdateien, die auf Ihrem Rechner abgelegt werden und die Ihr Browser speichert.

      Die meisten der von uns verwendeten Cookies sind so genannte “Session-Cookies”. Sie werden nach Ende Ihres Besuchs automatisch gelöscht. Andere Cookies bleiben auf Ihrem Endgerät gespeichert bis Sie diese löschen. Diese Cookies ermöglichen es uns, Ihren Browser beim nächsten Besuch wiederzuerkennen.

      Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell ausschließen sowie das automatische Löschen der Cookies beim Schließen des Browser aktivieren. Bei der Deaktivierung von Cookies kann die Funktionalität dieser Website eingeschränkt sein.

      Cookies, die zur Durchführung des elektronischen Kommunikationsvorgangs oder zur Bereitstellung bestimmter, von Ihnen erwünschter Funktionen (z.B. Warenkorbfunktion) erforderlich sind, werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert. Der Websitebetreiber hat ein berechtigtes Interesse an der Speicherung von Cookies zur technisch fehlerfreien und optimierten Bereitstellung seiner Dienste. Soweit andere Cookies (z.B. Cookies zur Analyse Ihres Surfverhaltens) gespeichert werden, werden diese in dieser Datenschutzerklärung gesondert behandelt.

      ### Server-Log-Dateien

      Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:

      - (h3) Browsertyp und Browserversion

      - (h3) verwendetes Betriebssystem

      - (h3) Referrer URL

      - (h3) Hostname des zugreifenden Rechners

      - (h3) Uhrzeit der Serveranfrage

      - (h3) IP-Adresse

      Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.

      Grundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. f DSGVO, der die Verarbeitung von Daten zur Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen gestattet.

      ### Kontaktformular

      Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.

      Die Verarbeitung der in das Kontaktformular eingegebenen Daten erfolgt somit ausschließlich auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie können diese Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitungsvorgänge bleibt vom Widerruf unberührt.

      Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z.B. nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.

      ### Datenübermittlung bei Vertragsschluss für Dienstleistungen und digitale Inhalte

      Wir übermitteln personenbezogene Daten an Dritte nur dann, wenn dies im Rahmen der Vertragsabwicklung notwendig ist, etwa an das mit der Zahlungsabwicklung beauftragte Kreditinstitut.

      Eine weitergehende Übermittlung der Daten erfolgt nicht bzw. nur dann, wenn Sie der Übermittlung ausdrücklich zugestimmt haben. Eine Weitergabe Ihrer Daten an Dritte ohne ausdrückliche Einwilligung, etwa zu Zwecken der Werbung, erfolgt nicht.

      Grundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. b DSGVO, der die Verarbeitung von Daten zur Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen gestattet.

      ### 4. Analyse Tools und Werbung

      ### Google Analytics

      Diese Website nutzt Funktionen des Webanalysedienstes Google Analytics. Anbieter ist die Google Inc., 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.

      Google Analytics verwendet so genannte "Cookies". Das sind Textdateien, die auf Ihrem Computer gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglichen. Die durch den Cookie erzeugten Informationen über Ihre Benutzung dieser Website werden in der Regel an einen Server von Google in den USA übertragen und dort gespeichert.

      Die Speicherung von Google-Analytics-Cookies erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der Analyse des Nutzerverhaltens, um sowohl sein Webangebot als auch seine Werbung zu optimieren.

      ### IP Anonymisierung

      Wir haben auf dieser Website die Funktion IP-Anonymisierung aktiviert. Dadurch wird Ihre IP-Adresse von Google innerhalb von Mitgliedstaaten der Europäischen Union oder in anderen Vertragsstaaten des Abkommens über den Europäischen Wirtschaftsraum vor der Übermittlung in die USA gekürzt. Nur in Ausnahmefällen wird die volle IP-Adresse an einen Server von Google in den USA übertragen und dort gekürzt. Im Auftrag des Betreibers dieser Website wird Google diese Informationen benutzen, um Ihre Nutzung der Website auszuwerten, um Reports über die Websiteaktivitäten zusammenzustel

      ### Browser Plugin

      Sie können die Speicherung der Cookies durch eine entsprechende Einstellung Ihrer Browser-Software verhindern; wir weisen Sie jedoch darauf hin, dass Sie in diesem Fall gegebenenfalls nicht sämtliche Funktionen dieser Website vollumfänglich werden nutzen können. Sie können darüber hinaus die Erfassung der durch den Cookie erzeugten und auf Ihre Nutzung der Website bezogenen Daten (inkl. Ihrer IP-Adresse) an Google sowie die Verarbeitung dieser Daten durch Google verhindern, indem Sie das unter dem folgenden Link

      verfügbare Browser-Plugin herunterladen und installieren: [https://tools.google.com/dlpage/gaoptout?hl=de](https://tools.google.com/dlpage/gaoptout?hl=de).

      ### Widerspruch gegen Datenerfassung

      Sie können die Erfassung Ihrer Daten durch Google Analytics verhindern, indem Sie auf folgenden Link klicken. Es wird ein Opt-Out-Cookie gesetzt, der die Erfassung Ihrer Daten bei zukünftigen Besuchen dieser Website verhindert: Google Analytics deaktivieren.

      Mehr Informationen zum Umgang mit Nutzerdaten bei Google Analytics finden Sie in der Datenschutzerklärung von Google: [https://support.google.com/analytics/answer/6004245?hl=de](https://support.google.com/analytics/answer/6004245?hl=de).

      ### Auftragsdatenverarbeitung

      Wir haben mit Google einen Vertrag zur Auftragsdatenverarbeitung abgeschlossen und setzen die strengen Vorgaben der deutschen Datenschutzbehörden bei der Nutzung von Google Analytics vollständig um.

      ### Demografische Merkmale bei Google Analytics

      Diese Website nutzt die Funktion “demografische Merkmale” von Google Analytics. Dadurch können Berichte erstellt werden, die Aussagen zu Alter, Geschlecht und Interessen der Seitenbesucher enthalten. Diese Daten stammen aus interessenbezogener Werbung von Google sowie aus Besucherdaten von Drittanbietern. Diese Daten können keiner bestimmten Person zugeordnet werden. Sie können diese Funktion jederzeit über die Anzeigeneinstellungen in Ihrem GoogleKonto deaktivieren oder die Erfassung Ihrer Daten durch Google Analytics wie im Punkt “Widerspruch gegen Datenerfassung” darges

      ### Google Analytics Remarketing

      Unsere Websites nutzen die Funktionen von Google Analytics Remarketing in Verbindung mit den geräteübergreifenden Funktionen von Google AdWords und Google DoubleClick. Anbieter ist die Google Inc., 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.

      Diese Funktion ermöglicht es die mit Google Analytics Remarketing erstellten Werbe-Zielgruppen mit den geräteübergreifenden Funktionen von Google AdWords und Google DoubleClick zu verknüpfen. Auf diese Weise können interessenbezogene, personalisierte Werbebotschaften, die in Abhängigkeit Ihres früheren Nutzungs- und Surfverhaltens auf einem Endgerät (z.B. Handy) an Sie angepasst wurden auch auf einem anderen Ihrer Endgeräte (z.B. Tablet oder PC) angezeigt werden.

      Haben Sie eine entsprechende Einwilligung erteilt, verknüpft Google zu diesem Zweck Ihren Web- und App-Browserverlauf mit Ihrem Google-Konto. Auf diese Weise können auf jedem Endgerät auf dem Sie sich mit Ihrem Google-Konto anmelden, dieselben personalisierten Werbebotschaften geschaltet werden.

      Zur Unterstützung dieser Funktion erfasst Google Analytics google-authentifizierte IDs der Nutzer, die vorübergehend mit unseren Google-Analytics-Daten verknüpft werden, um Zielgruppen für die geräteübergreifende Anzeigenwerbung zu definieren und zu erstellen.

      Sie können dem geräteübergreifenden Remarketing/Targeting dauerhaft widersprechen, indem Sie personalisierte Werbung in Ihrem Google-Konto deaktivieren; folgen Sie hierzu diesem Link: [https://www.google.com/settings/ads/onweb/](https://www.google.com/settings/ads/onweb/).

      Die Zusammenfassung der erfassten Daten in Ihrem Google-Konto erfolgt ausschließlich auf Grundlage Ihrer Einwilligung, die Sie bei Google abgeben oder widerrufen können (Art. 6 Abs. 1 lit. a DSGVO). Bei Datenerfassungsvorgängen, die nicht in Ihrem Google-Konto zusammengeführt werden (z.B. weil Sie kein Google-Konto haben oder der Zusammenführung widersprochen haben) beruht die Erfassung der Daten auf Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse ergibt sich daraus, dass der Websitebetreiber ein Interesse an der anonymisierten Analyse der Websitebesucher zu Werbezwecken ha

      Weitergehende Informationen und die Datenschutzbestimmungen finden Sie in der Datenschutzerklärung von Google unter: [https://www.google.com/policies/technologies/ads/](https://www.google.com/policies/technologies/ads/).

      ### Google AdWords und Google Conversion-Tracking

      Diese Website verwendet Google AdWords. AdWords ist ein Online-Werbeprogramm der Google Inc., 1600 Amphitheatre Parkway, Mountain View, CA 94043, United States (“Google”).

      Im Rahmen von Google AdWords nutzen wir das so genannte Conversion-Tracking. Wenn Sie auf eine von Google geschaltete Anzeige klicken wird ein Cookie für das Conversion-Tracking gesetzt. Bei Cookies handelt es sich um kleine Textdateien, die der InternetBrowser auf dem Computer des Nutzers ablegt. Diese Cookies verlieren nach 30 Tagen ihre Gültigkeit und dienen nicht der persönlichen Identifizierung der Nutzer. Besucht der Nutzer bestimmte Seiten dieser Website und das Cookie ist noch nicht abgelaufen, können Google und wir

      erkennen, dass der Nutzer auf die Anzeige geklickt hat und zu dieser Seite weitergeleitet wurde.

      Jeder Google AdWords-Kunde erhält ein anderes Cookie. Die Cookies können nicht über die Websites von AdWords-Kunden nachverfolgt werden. Die mithilfe des Conversion-Cookies eingeholten Informationen dienen dazu, Conversion-Statistiken für AdWords-Kunden zu erstellen, die sich für Conversion-Tracking entschieden haben. Die Kunden erfahren die Gesamtanzahl der Nutzer, die auf ihre Anzeige geklickt haben und zu einer mit einem Conversion-Tracking-Tag versehenen Seite weitergeleitet wurden. Sie erhalten jedoch keine Informationen, mit denen sich Nutzer persönlich identifizieren lass

      Die Speicherung von “ConversionCookies” erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der Analyse des Nutzerverhaltens, um sowohl sein Webangebot als auch seine Werbung zu optimieren.

      Mehr Informationen zu Google AdWords und Google ConversionTracking finden Sie in den Datenschutzbestimmungen von Google: [https://www.google.de/policies/privacy/](https://www.google.de/policies/privacy/).

      Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell ausschließen sowie das automatische Löschen der Cookies beim Schließen des Browser aktivieren. Bei der Deaktivierung von Cookies kann die Funktionalität dieser Website eingeschränkt sein.

      ### Facebook Pixel

      Unsere Website nutzt zur Konversionsmessung das Besucheraktions-Pixel von Facebook, Facebook Inc., 1601 S. California Ave, Palo Alto, CA 94304, USA (“Facebook”).

      So kann das Verhalten der Seitenbesucher nachverfolgt werden, nachdem diese durch Klick auf eine Facebook-Werbeanzeige auf die Website des Anbieters weitergeleitet wurden. Dadurch können die Wirksamkeit der Facebook-Werbeanzeigen für statistische und Marktforschungszwecke ausgewertet werden und zukünftige Werbemaßnahmen optimiert werden.

      Die erhobenen Daten sind für uns als Betreiber dieser Website anonym, wir können keine Rückschlüsse auf die Identität der Nutzer ziehen. Die Daten werden aber von Facebook gespeichert und verarbeitet, sodass eine Verbindung zum jeweiligen Nutzerprofil möglich ist und Facebook die Daten für eigene Werbezwecke, entsprechend der [FacebookDatenverwendungsrichtlinie](https://www.facebook.com/privacy/policy/?entry_point=data_policy_redirect&entry=0) verwenden kann. Dadurch kann Facebook das Schalten von Werbeanzeigen auf Seiten von Facebook sowie außerhalb von Facebook ermöglichen.

      In den Datenschutzhinweisen von Facebook finden Sie weitere Hinweise zum Schutz Ihrer Privatsphäre: [https://www.facebook.com/about/privacy/](https://www.facebook.com/about/privacy/).

      Sie können außerdem die Remarketing-Funktion “Custom Audiences” im Bereich Einstellungen für Werbeanzeigen unter [https://www.facebook.com/ads/preferences/?entry_product=ad_settings_screen](https://www.facebook.com/ads/preferences/?entry_product=ad_settings_screen) deaktivieren. Dazu müssen Sie bei Facebook angemeldet sein.

      Wenn Sie kein Facebook Konto besitzen, können Sie nutzungsbasierte Werbung von Facebook auf der Website der European Interactive Digital Advertising Alliance deaktivieren: [http://www.youronlinechoices.com/de/praferenzmanagement/](http://www.youronlinechoices.com/de/praferenzmanagement/).

      ### Albacross

      Wir holen Ihre Zustimmung zur Verarbeitung personenbezogener Daten im Namen von Albacross Nordic AB („Albacross“) ein.

      Informationen, die von den auf Ihrem Gerät gesetzten Cookies gesammelt werden und als personenbezogene Daten gelten, werden von Albacross verarbeitet, einem Unternehmen, das Lead-Identifizierungs- und Ad-Targeting-Dienste mit Büros in Stockholm und Krakau anbietet. Die vollständigen Kontaktdaten finden Sie weiter unten.

      Der Zweck der Verarbeitung der personenbezogenen Daten besteht darin, Albacross in die Lage zu versetzen, einen für uns und unsere Website erbrachten Dienst (z. B. den Dienst „Lead Generation“) zu verbessern, indem sie ihrer Datenbank Daten über Unternehmen hinzufügen.

      Die Daten, die von Albacross zu diesem Zweck erhoben und verwendet werden, sind Informationen über die IP-Adresse, von der aus Sie unsere Website besucht haben, sowie technische Informationen, die es Albacross ermöglichen, verschiedene Besucher von derselben IP-Adresse zu unterscheiden. Albacross speichert die Domain aus Formulareingaben, um die IP-Adresse mit Ihrem Arbeitgeber in Verbindung zu bringen.

      Ausführliche Informationen über die Verarbeitung personenbezogener Daten durch Albacross finden Sie in unserer [Datenschutzrichtlinie](https://www.albacross.com/privacy-policy).

      Sie können Ihre Zustimmung zu dieser Verarbeitung jederzeit widerrufen. Ein solcher Widerruf kann entweder durch Kontaktaufnahme mit uns oder durch direkte Kontaktaufnahme mit Albacross erfolgen.

      Albacross Nordic AB

      Company reg. no 556942-7338

      Kungsgatan 26

      111 35 Stockholm

      Sweden

      albacross.com - contact@albacross.com

      ### 5. Newsletter

      ### Newsletterdaten

      Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind und mit dem Empfang des Newsletters einverstanden sind. Weitere Daten werden nicht bzw. nur auf freiwilliger Basis erhoben. Diese Daten verwenden wir ausschließlich für den Versand der angeforderten Informationen und geben diese nicht an Dritte weiter.

      Die Verarbeitung der in das Newsletteranmeldeformular eingegebenen Daten erfolgt ausschließlich auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Die erteilte Einwilligung zur Speicherung der Daten, der E-MailAdresse sowie deren Nutzung zum Versand des Newsletters können Sie jederzeit widerrufen, etwa über den "Austragen"-Link im Newsletter. Die Rechtmäßigkeit der bereits

      erfolgten Datenverarbeitungsvorgänge bleibt vom Widerruf unberührt.

      Die von Ihnen zum Zwecke des Newsletter-Bezugs bei uns hinterlegten Daten werden von uns bis zu Ihrer Austragung aus dem Newsletter gespeichert und nach der Abbestellung des Newsletters gelöscht. Daten, die zu anderen Zwecken bei uns gespeichert wurden (z.B. E-Mail-Adressen für den Mitgliederbereich) bleiben hiervon unberührt.

      ### MailChimp

      Diese Website nutzt die Dienste von MailChimp für den Versand von Newslettern. Anbieter ist die Rocket Science Group LLC, 675 Ponce De Leon Ave NE, Suite 5000, Atlanta, GA 30308, USA.

      MailChimp ist ein Dienst, mit dem u.a. der Versand von Newslettern organisiert und analysiert werden kann. Wenn Sie Daten zum Zwecke des Newsletterbezugs eingeben (z.B. E-Mail-Adresse), werden diese auf den Servern von MailChimp in den USA gespeichert.

      MailChimp verfügt über eine Zertifizierung nach dem “EU-USPrivacy-Shield”. Der “Privacy-Shield” ist ein Übereinkommen zwischen der Europäischen Union (EU) und den USA, das die Einhaltung europäischer Datenschutzstandards in den USA gewährleisten soll.

      Mit Hilfe von MailChimp können wir unsere Newsletterkampagnen analysieren. Wenn Sie eine mit MailChimp versandte E-Mail öffnen, verbindet sich eine in der E-Mail enthaltene Datei (sog. web-beacon) mit den Servern von MailChimp in den USA. So kann festgestellt werden, ob eine Newsletter-Nachricht geöffnet und welche Links ggf. angeklickt wurden. Außerdem werden technische Informationen erfasst (z.B. Zeitpunkt des Abrufs, IP-Adresse, Browsertyp und Betriebssystem). Diese Informationen können nicht dem jeweiligen Newsletter-Empfänger zugeordnet werden. Sie dienen ausschließlich de

      Wenn Sie keine Analyse durch MailChimp wollen, müssen Sie den Newsletter abbestellen. Hierfür stellen wir in jeder Newsletternachricht einen entsprechenden Link zur Verfügung. Des Weiteren können Sie den Newsletter auch direkt auf der Website abbestellen.

      Die Datenverarbeitung erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie können diese Einwilligung jederzeit widerrufen, indem Sie den Newsletter abbestellen. Die Rechtmäßigkeit der bereits erfolgten Datenverarbeitungsvorgänge bleibt vom Widerruf unberührt.

      Die von Ihnen zum Zwecke des Newsletter-Bezugs bei uns hinterlegten Daten werden von uns bis zu Ihrer Austragung aus dem Newsletter gespeichert und nach der Abbestellung des Newsletters sowohl von unseren Servern als auch von den Servern von MailChimp gelöscht. Daten, die zu anderen Zwecken bei uns gespeichert wurden (z.B. E-Mail-Adressen für den Mitgliederbereich) bleiben hiervon unberührt.

      Näheres entnehmen Sie den Datenschutzbestimmungen von MailChimp unter: [https://mailchimp.com/legal/terms/](https://mailchimp.com/legal/terms/).

      ### Abschluss eines DataProcessing-Agreements

      Wir haben ein sog. „Data-ProcessingAgreement“ mit MailChimp abgeschlossen, in dem wir MailChimp verpflichten, die Daten unserer Kunden zu schützen und sie nicht an Dritte weiterzugeben. Dieser Vertrag kann unter folgendem Link eingesehen werden: [https://mailchimp.com/legal/forms/data-processing-agreement/sampleagreement/](https://mailchimp.com/legal/forms/data-processing-agreement/sampleagreement/).

      ### 6. Plugins und Tools

      ### Vimeo

      Unsere Website nutzt Plugins der von Vimeo, Inc. betriebenen Seite Vimeo. Betreiber der Seiten ist die Vimeo Inc., 555 West 18th Street, New York, New York 10011, USA.

      Wenn Sie eine unserer mit einem Vimeo-Plugin ausgestatteten Seiten besuchen, wird eine Verbindung zu den Servern von Vimeo hergestellt. Dabei wird dem Vimeo-Server mitgeteilt, welche unserer Seiten Sie besucht haben.

      Wenn Sie in Ihrem Vimeo-Account eingeloggt sind, ermöglichen Sie Vimeo, Ihr Surfverhalten direkt Ihrem persönlichen Profil zuzuordnen. Dies können Sie verhindern, indem Sie sich aus Ihrem Vimeo-Account ausloggen.

      Die Nutzung von Vimeo erfolgt im Interesse einer ansprechenden Darstellung unserer Online-Angebote. Dies stellt ein berechtigtes Interesse im Sinne von Art. 6 Abs. 1 lit. f DSGVO dar.

      Weitere Informationen zum Umgang mit Nutzerdaten finden Sie in der Datenschutzerklärung von Vimeo unter: [https://vimeo.com/privacy.](https://vimeo.com/privacy.)
```

## en

```yaml
nav:
  items:
    - { label: "Home", href: "/" }
    - { label: "Our design", href: "/about-us" }
    - { label: "Rotpunktkuechen.de", href: "https://www.rotpunktkuechen.de/en", external: true }
  cta: { label: "Visualise your kitchen", href: "/studio" }

footer:
  columns:
    - title: "Links"
      links:
        - { label: "Data Protection", href: "https://www.rotpunktkuechen.de/en/data-protection", external: true }
        - { label: "Disclaimer", href: "/disclaimer" }
        - { label: "Rotpunkt Website", href: "https://www.rotpunktkuechen.de/en", external: true }
  copyright: "2026 © Rotpunkt Küchen"
  note: "Made in Germany"

home:
  hero:
    eyebrow: "Inspirations"
    title: "From imagination to *inspiration*."
    subline: "Stop dreaming, start seeing. Describe the kitchen you've always wanted – our AI creates a visualisation in the signature Rotpunkt style."
    cta: { label: "Visualise your kitchen", href: "/studio" }
    filmLabel: "Watch the film"
    badge: "Made in Germany"
    video:
      src: "/video/hero-loop.mp4"
      poster: "/video/hero-poster.jpg"

  manifest:
    label: "Inspirations"
    statement:
      - { text: "Stop dreaming, start" }
      - { text: "seeing.", serif: true }
    paragraphs:
      - "Describe the kitchen you've always wanted – from the materials to the mood – and our AI will create a beautiful, high-quality visualization in the signature Rotpunkt style."
      - "Save your favorite designs, share them with your family, and take the first concrete step toward making your dream kitchen a reality."
    image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968553/high-res-image-1771543375441_tide3z.png"
    alt: "Dark kitchen island with brass handles and LED lighting"
    caption: "Visualisation in the Rotpunkt style – dark island, brass, evening light"
    cta: { label: "The four promises", href: "#zusagen" }

  promises:
    label: "Rotpunkt Visions"
    title: "Four promises. One *image*."
    intro: "Not a generic image generator. Every visualisation is built from real Rotpunkt fronts and handles, from your layout – and checked before you see it."
    items:
      - id: "fronten"
        label: "Material"
        title: "Real Rotpunkt fronts"
        body: "Catalogue front colours and FENIX surfaces, exactly as they will stand in your kitchen."
        detail:
          - "The visualisation knows the Rotpunkt fronts as they are: lacquer, wood, matt synthetic and metal fronts from the front-colour catalogue, and the FENIX range with its super-matt, soft-touch surface."
          - "What you choose is the front Rotpunkt manufactures – in colour, material and finish."
      - id: "griffe"
        label: "Handles"
        title: "Handles as designed"
        body: "Handleless, Tokyo profile, Buster & Punch or a classic bar – every geometry sits where it belongs."
        detail:
          - "Each handle type has its own mounting rule: a knob with a single point, a bar with two feet on the same front, the Tokyo profile as a continuous edge. The visualisation follows these rules instead of inventing hardware."
      - id: "aufteilung"
        label: "Layout"
        title: "Your layout"
        body: "Galley, L-shape or island – you decide where sink and cooktop go."
        detail:
          - "For an island kitchen you decide whether sink and cooktop sit on the wall run or on the island. That layout is part of the brief to the image model and is checked afterwards."
      - id: "pruefung"
        label: "Quality"
        title: "Verified images"
        body: "A vision model checks sink, faucet, cooktop and perspective before an image is shown."
        detail:
          - "Image generators like to invent a second faucet or a second basin. So a second model checks every visualisation against your brief: exactly one sink, one faucet, one cooktop, the chosen perspective."
          - "An image that fails the check is not shown – you get a fresh variant instead."
    cta: { label: "Visualise your kitchen", href: "/studio" }

  gallery:
    label: "Gallery"
    title: "From the *studio*."
    intro: "Six visualisations as users created them – each from its own configuration."
    items:
      - title: "Exterior terrace kitchen"
        description: "A blue island. At the sea."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1755780787/tmpfzpy88xv_tiaete.jpg"
      - title: "Small apartments."
        description: "The center of attention. In white."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968455/223-ecd09168-0255-4e1e-9d01-0c9e25f8d947_nr9ruq.png"
      - title: "Marbellous dreams."
        description: "A white lacquer kitchen with a marble luxurious surface."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968553/high-res-image-1771543375441_tide3z.png"
      - title: "Light & dark."
        description: "A dark elegant kitchen island with lights and accents."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968651/high-res-image-1771581854372_q7vhzp.png"
      - title: "The detail is the secret."
        description: "Contrasts at large."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968771/38fe550e-c5f9-457a-bc33-db9ae223c10d-1337-3b82eb30-0b78-11f1-81c6-8211398b70a4_lpiz2w.png"
      - title: "Minimalistic & individual."
        description: "Our different take on a zebra style."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968938/229-f5ccee15-6cd8-4474-a3c6-553aec6698a2_u7133h.png"
    cta: { label: "Design that affects you.", href: "/about-us" }

  studio:
    label: "Configurator"
    title: "Eight decisions. One *image*."
    body: "Setting, room, colour world, handle, atmosphere, floor, accessories and your wishes – guided, step by step. The image takes under a minute and is checked before you see it."
    image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1771968771/38fe550e-c5f9-457a-bc33-db9ae223c10d-1337-3b82eb30-0b78-11f1-81c6-8211398b70a4_lpiz2w.png"
    alt: "Night impression of a luxury kitchen on the terrace"
    stages:
      - { id: "raum", label: "Room", title: "Room and layout", body: "Setting, kitchen layout, sink and cooktop." }
      - { id: "material", label: "Material", title: "Fronts and handles", body: "Front colours, FENIX and the original handle." }
      - { id: "atmosphaere", label: "Atmosphere", title: "Style, perspective, light", body: "From loft to country house, from eye level to bird's eye." }
    steps:
      - { label: "Configure", title: "Eight steps", body: "Every choice is a card – a picture instead of jargon." }
      - { label: "Generate", title: "Under a minute", body: "The AI renders in the Rotpunkt style, with your fronts and handles." }
      - { label: "Verify", title: "Before you see it", body: "A vision model checks sink, cooktop and perspective." }
      - { label: "Keep", title: "Your gallery", body: "Save, upscale, share – and take it to your dealer." }
    cta: { label: "Start visualising", href: "/studio" }
    explainerLabel: "How it works"
    explainerTitle: "Four *steps*."
    explainerIntro: "From the first choice to a verified image – at your pace, with sign-in only when you generate."
    note: "Sign in with Google or e-mail only when you generate."

  closing:
    title: "Start *seeing*."
    body: "Configure as a guest, sign in to generate – your visualisations stay in your gallery, one click away from your dealer."
    cta: { label: "Visualise your kitchen", href: "/studio" }

pages:
  about-us:
    slug: "about-us"
    title: "Our design"
    kind: "about"
    translations: { de: "ueber-uns", en: "about-us" }
    hero:
      heading: "Ideas to grow."
      subheading: "For you. With you."
      video: "https://res.cloudinary.com/dsuqmlyyl/video/upload/v1757589934/iStock-1459952878_suesser_kleiner_junge_bpfrpg.mp4"
      alt: "Child"
    headline:
      eyebrow: "For us, standard is anything but ordinary."
      headline: "Innovation & *Design*."
      subhead: "Each kitchen is crafted with the utmost care – sturdy, durable, and with a design that impresses down to the last detail. Perfectly coordinated inside and out, with high-quality materials and ingenious solutions that make everyday life easier."
    cards:
      - title: "Perfectly coordinated inside and out."
        description: "Experience quality. To the touch."
        body: "Kitchens are a place of well-being, a place to spend time with family and friends. And that means everything has to be perfectly coordinated – whether it's ergonomics, materials, or function. That's the essence of design."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1757596789/csm_00_arbeitsplatten__2200_1375_db76226c09_vrcj2q.webp"
        cta: { label: "Rotpunkt", href: "https://www.rotpunktkuechen.de/", external: true }
      - title: "Design"
        description: "Design with emotion."
        body: "Driven by the passion to produce kitchens that make hearts beat faster, we at Rotpunkt have been continuously evolving for over nine decades."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1757596789/csm_MK4C_A01_Verde-Kitami_02_NEU-EDIT_a59a684618_yff1lp.webp"
        cta: { label: "Rotpunkt", href: "https://www.rotpunktkuechen.de/", external: true }
      - title: "Kitchens – about the world we live in"
        description: "Products & responsibility"
        body: "We take responsibility: Our production is climate-friendly, the materials used are sustainable and safe for your health. This way you not only enjoy greater comfort, but also peace of mind."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1757596789/csm_Rotpunkt_MK6_header__2200x1375_da02e2eda8_ok1tuk.webp"
        cta: { label: "Rotpunkt", href: "https://www.rotpunktkuechen.de/", external: true }
      - title: "Individual – like people"
        description: "Details that add value"
        body: "Individually planned kitchens. We offer the complete range of kitchen modules and designs that turn a kitchen into a home."
        image: "https://res.cloudinary.com/dsuqmlyyl/image/upload/v1757596789/csm_00_kachel_RP_Griff_Bronze__W7A5033_02__2200_1375_70392ee396_gikoxr.webp"
        cta: { label: "Rotpunkt", href: "https://www.rotpunktkuechen.de/", external: true }

  disclaimer:
    slug: "disclaimer"
    title: "Disclaimer"
    kind: "legal"
    translations: { de: "disclaimer", en: "disclaimer" }
    markdown: |
      # Impressum

      **Rotpunkt Küchen GmbH**
      Ladestraße 52
      32257 Bünde
      Germany

      Postfach 2626
      32226 Bünde

      Tel.: +49 (0) 5223 6900-0
      Fax: +49 (0) 5223 6900-100
      E-Mail: info@rotpunktkuechen.de

      ### Handelsregister

      Amtsgericht Bad Oeynhausen, HRB 15361

      ### Vertretungsberechtigte Geschäftsführer

      Heinz-Jürgen Meyer, Andreas Wagner, Sven Herden

      ### Umsatzsteuer-Identifikationsnummer

      DE173456377

      ### Inhaltlich verantwortlich

      Andreas Wagner

      ### Konzeption, Gestaltung und Webentwicklung

      definiton.group Jever · Wilhelmshaven · Las Palmas
      [https://www.definition.studio](https://definition.studio)

      ### Haftungsausschluss

      **1. Inhalt des Onlineangebotes**

      Der Autor übernimmt keinerlei Gewähr für die Aktualität, Korrektheit, Vollständigkeit oder Qualität der bereitgestellten Informationen. Haftungsansprüche gegen den Autor, welche sich auf Schäden materieller oder ideeller Art beziehen, die durch die Nutzung oder Nichtnutzung der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und unvollständiger Informationen verursacht wurden sind grundsätzlich ausgeschlossen, sofern seitens des Autors kein nachweislich vorsätzliches oder grob fahrlässiges Verschulden vorliegt.

      Alle Angebote sind freibleibend und unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.

      **2. Verweise und Links**

      Bei direkten oder indirekten Verweisen auf fremde Internetseiten ("Links"), die außerhalb des Verantwortungsbereiches des Autors liegen, würde eine Haftungsverpflichtung ausschließlich in dem Fall in Kraft treten, in dem der Autor von den Inhalten Kenntnis hat und es ihm technisch möglich und zumutbar wäre, die Nutzung im Falle rechtswidriger Inhalte zu verhindern.

      Der Autor erklärt daher ausdrücklich, dass zum Zeitpunkt der Linksetzung die entsprechenden verlinkten Seiten frei von illegalen Inhalten waren. Der Autor hat keinerlei Einfluss auf die aktuelle und zukünftige Gestaltung und auf die Inhalte der gelinkten / verknüpften Seiten. Deshalb distanziert er sich hiermit ausdrücklich von allen Inhalten aller gelinkten / verknüpften Seiten, die nach der Linksetzung verändert wurden. Diese Feststellung gilt für alle innerhalb des eigenen Internetangebotes gesetzten Links und Verweise sowie für Fremdeinträge in vom Autor eingerichteten Gästebüchern, Diskussionsforen und Mailinglisten. Für illegale, fehlerhafte oder unvollständige Inhalte und insbesondere für Schäden, die aus der Nutzung oder Nichtnutzung solcherart dargebotener Informationen entstehen, haftet allein der Anbieter der Seite, auf welche verwiesen wurde, nicht derjenige, der über Links auf die jeweilige Veröffentlichung lediglich verweist.

      **3. Urheber- und Kennzeichenrecht**

      Der Autor ist bestrebt, in allen Publikationen die Urheberrechte der verwendeten Grafiken, Tondokumente, Videosequenzen und Texte zu beachten, von ihm selbst erstellte Grafiken, Tondokumente, Videosequenzen und Texte zu nutzen oder auf lizenzfreie Grafiken, Tondokumente, Videosequenzen und Texte zurückzugreifen.

      Alle innerhalb des Internetangebotes genannten und ggf. durch Dritte geschützten Marken- und Warenzeichen unterliegen uneingeschränkt den Bestimmungen des jeweils gültigen Kennzeichenrechts und den Besitzrechten der jeweiligen eingetragenen Eigentümer. Allein aufgrund der bloßen Nennung ist nicht der Schluss zu ziehen, dass Markenzeichen nicht durch Rechte Dritter geschützt sind! Das Copyright für veröffentlichte, vom Autor selbst erstellte Objekte bleibt allein beim Autor der Seiten. Eine Vervielfältigung oder Verwendung solcher Grafiken, Tondokumente, Videosequenzen und Texte in anderen elektronischen oder gedruckten Publikationen ist ohne ausdrückliche Zustimmung des Autors nicht gestattet.

      **4. Rechtswirksamkeit dieses Haftungsausschlusses**

      Dieser Haftungsausschluss ist als Teil des Internetangebotes zu betrachten, von dem aus auf diese Seite verwiesen wurde. Sofern Teile oder einzelne Formulierungen dieses Textes der geltenden Rechtslage nicht, nicht mehr oder nicht vollständig entsprechen sollten, bleiben die übrigen Teile des Dokumentes in ihrem Inhalt und ihrer Gültigkeit davon unberührt.
```
