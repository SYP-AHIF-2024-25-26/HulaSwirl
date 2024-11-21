# Projektantrag - Hula Swirl

## 1. Teammitglieder
* Moritz Bernhofer
* Caroline Hornhuber
* Leo Oberndorfer

## 2. Ausgangslage

### 2.1 Ist-Situation
Stellen wir uns vor, wir sind auf einer Sommerparty und möchten das perfekte Erfrischungsgetränk oder den perfekten Smoothie mischen. Aktuell muss man das per Hand machen, da Miet-Mischgeräte über 400 € kosten. Dabei entstehen oft unappetitliche Erfrischungs- und Smoothie-Getränke.

### 2.2 Verbesserungspotenziale
Es besteht ein Bedarf an einer automatischen Mischmaschine, mit der man über ein Interface automatisch perfekte Getränke herstellen kann. Außerdem erscheinen oft neue Rezepte, die man erst lernen muss, bevor man sie verwenden kann. Eine automatische Rezeptfunktion auf einem Interface wäre daher sehr nützlich.

## 3. Zielsetzung
Da wir selbst nicht gut im manuellen Getränkemischen sind, wollen wir den Hula Swirl entwickeln. Der Hula Swirl ist ein automatischer Getränkemischer, der 10 flüssige Zutaten halten kann und damit die perfekten Erfrischungsgetränke oder Smoothies in den richtigen Mengen zubereitet. Über eine Web-App teilt man dem Gerät mit, welches Getränk man möchte.

### 3.1 Skizze
(todo)

### 3.2 Schaltplan
(todo)
## 4. Chancen und Risiken

### 4.1 Risiken
* **Zeitrisiko:** Es besteht die Möglichkeit, dass wir es in den zwei Jahren nicht schaffen, ein fertiges, funktionierendes Produkt zu erstellen.
* **Verwertbarkeitsrisiko:** Das Risiko besteht, dass das finale Produkt sehr unhandlich und unpraktisch wird.
* **Technisches Realisierungsrisiko:** Es könnte während der Produktion zu technischen Herausforderungen wie Problemen mit den Ventilen, der Stromversorgung oder der Verbindung mit der Web-App kommen. Außerdem könnte unser Budget für das Projekt nicht ausreichen.

### 4.2 Chancen
Der Hula Swirl bietet großes Marktpotenzial als automatisiertes Getränkemischgerät für private Anwender und kleinere Events. Mit KI-basierter Rezeptintegration und einfacher Bedienung hebt er sich von teureren Alternativen ab und ermöglicht eine gleichbleibende Getränkqualität. Die smarte, anpassbare Technik passt gut in moderne Haushalte und könnte durch Updates oder neue Funktionen erweitert werden, was das Nutzerinteresse zusätzlich steigern dürfte.

## 5. User Stories
### 1. User Story: Als Nutzer will ich mir ein Getränk über die Web-App auslassen können.
- **Beschreibung:** Der Nutzer kann über die Web-App ein Getränk auswählen und sich ein getränk machen lassen.
- **Akzeptanzkriterien:**
  - Die Web-App zeigt eine Liste verfügbarer Getränke an.
  - Der Nutzer kann ein Getränk auswählen und mit einem Klick den Mischvorgang starten.
  - Der Hula Swirl beginnt automatisch mit der Zubereitung.
- **Technische Anforderungen:**
  - Echtzeitkommunikation zwischen Web-App und Mischgerät.
  - Stabile API-Schnittstelle für Befehle und Statusupdates.

### 2. User Story: Als Gastgeber will ich meine verfügbaren Zutaten eingeben können, damit ich weiß, welche Getränke gemischt werden können.
- **Beschreibung:** Der Gastgeber gibt die aktuell verfügbaren Zutaten in der Web-App ein, sodass die App die passenden Rezepte anzeigt.
- **Akzeptanzkriterien:**
  - Eine Übersichtsliste zeigt die verfügbaren Zutaten an.
  - Der Gastgeber kann Zutaten hinzufügen und entfernen.
  - Der Gastgeber kann Zutaten als "Leer" makieren, sodass rezepte, die diese benötigen nicht mehr angezeigt werden.
  - Die Liste der auswählbaren Getränke wird automatisch aktualisiert.
- **Technische Anforderungen:**
  - Datenbank zur Speicherung der verfügbaren Zutaten.
  - Dynamische Filterfunktion für Rezepte basierend auf den eingegebenen Zutaten.

### 3. User Story: Als Admin will ich neue Getränke zur Auswahl hinzufügen können. Auch will ich die Optionen löschen oder bearbeiten können.
- **Beschreibung:** Der Admin kann Rezepte hinzufügen, löschen oder bearbeiten.
- **Akzeptanzkriterien:**
  - Der Admin kann über die Web-App ein neues Getränkerezept erstellen und speichern.
  - Bestehende Rezepte können editiert oder entfernt werden.
- **Technische Anforderungen:**
  - Backend-Funktionalität für CRUD (Create, Read, Update, Delete) von Rezepten.
  - Benutzerrollenverwaltung (Admin-Rechte).

### 4. User Story: Als Admin will ich eine Statistik haben, die zeigt, welche Getränke am meisten bestellt werden.
- **Beschreibung:** Eine Statistikfunktion gibt dem Admin Einblick, welche Getränke am häufigsten verwendet wurden.
- **Akzeptanzkriterien:**
  - Ein Dashboard zeigt die Anzahl der Bestellungen pro Getränk in einem bestimmten Zeitraum.
  - Daten können nach Tag, Woche oder Monat gefiltert werden.
  - Die Statistik ist visuell ansprechend (z. B. Balkendiagramme oder Tabellen).
- **Technische Anforderungen:**
  - Tracking- und Logging-Funktion für Getränkebestellungen.
  - Visualisierungsbibliothek für Diagramme und Tabellen.

## 6. GUI-Mockups für die Web-App
(todo)

### 7. Kostenschätzung

ca 120€ für den Protoyp
ca 150€ für die normale version
