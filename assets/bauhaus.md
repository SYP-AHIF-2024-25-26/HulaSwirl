## Auflistung der benötigten Komponenten

Um das Gerät zu replizieren, werden folgende Komponenten benötigt:

- Kabel
- Motor

### Bereits zur Verfügung gestellte Komponenten
Ihr erhaltet von mir:
- Pumpen
- Board
- Power Supply

Ihr müsst das Gerät nicht replizieren, sondern lediglich einen Raspberry Pi anschließen.

Falls ihr das Gerät jedoch neu bauen wollt, benötigt ihr zusätzlich:
- Lötkolben
- Kabel zum Verlöten

---

## Aufbau der Komponenten

### Chronologische Reihenfolge des Zusammenbaus
Es gibt keine feste chronologische Reihenfolge für den Aufbau des Schaltkreises. Er sollte einfach gemäß der Skizze aufgebaut werden. Wichtig ist:
- Der Schaltkreis sollte vollständig sein, bevor der Strom eingeschaltet wird.
- Alle relevanten Werte für Spannung (Volt) und Stromstärke (Ampere) sind in der Skizze vermerkt.

---

## Voraussetzungen für ein funktionierendes Gerät

### Wichtige Hinweise
Damit das Gerät ordnungsgemäß funktioniert und nicht beschädigt wird, sind folgende Punkte zu beachten:
- Die richtige Spannung (Volt) verwenden.
- Komponenten nicht falsch herum an den Stromkreis anschließen.
- Hardware vor Wasserkontakt schützen.
- Alle Verbindungen testen.

---

## Ablauf eines Requests: Backend & Hardware

Dieser Ablauf beschreibt, was bei einer Anfrage im Backend und in der Hardware passiert.

1. Der Request trifft im Backend ein.
2. Das Backend sendet eine Anfrage an den PumpManager (Service).
3. Der PumpManager steuert die VPump (VirtualPump).
4. Die VirtualPump wurde bereits beim Start initialisiert, dabei wurden ihr virtuelle Pins zugewiesen.
5. Die VPump greift auf diese virtuellen Pins zu, welche durch die `libgpio2`-Bibliothek an die echten Pins gemappt sind.
6. Diese Pins senden Signale entsprechend der Pinout-Beschreibung des Motortreibers.
7. Dadurch wird die Pumpe angetrieben.
8. Nach einer bestimmten Zeit wird das PWM-Signal gestoppt.
9. **ENDE**

### Wichtiger Hinweis zum Schaltplan
Der Schaltplan dient nicht nur zur Visualisierung, sondern ermöglicht mit entsprechendem Wissen den Nachbau des Geräts.
