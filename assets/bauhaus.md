## Auflistung der benötigten Komponenten

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

## Anleitung nach schaltplan ohne extra infos.(Interpretationsmöglichkeit der Bauhausgebrauchsanleitung)
ich nehme:
- Einen Raspberry Pi 5 mit vorinstalliertem Windows 11, weil Linux zu Mainstream ist.
- 4x USB-C Kabel (je mehr, desto besser. Zur Not nimm das von deiner Oma, sie braucht das eh nicht mehr).
- 1x handelsüblichen Starkstromkabel (idealerweise von einer alten Baustelle klauen).
- Einen Motor frisch ausgeschlachtet aus einem Mercedes.
- Lötkolben, Marke „Papa meinte, die Spitze kann man noch benutzen“.
- Lötzinn (je mehr, desto besser – wir machen Kunstwerke!).
- 2x Wasserpumpen, powered by Hoffnung(wie die römer).
- Power Supply 12V 5A, liebevolle Kartoffel mit zink.
- Tixo (aka das Klebeband, das alles zusammenhält, sogar Beziehungen).
- USB Stepdown, weil... warum nicht?
- Mut und eine Feuerversicherung.

ich habe:
* pumpen
* board

ich mache:
* ich nehm mein rasberry pi 5 und spiel windows 11 drauf.
* in die gpio pwm(olt)(32,33,12,35) pins steck ich mein usb kabel und mach drumrum bissi lötzinn
* diese gehen dann jeweils auf die zwei H bridges 1 und 2 in 2 und 2 da mach ich mit tixo die usb kaben fest
* gnd nehm ich normale handelsübliche starkstromkabel und leg es einfach auf gnd im rasberry
* von die h brigges nehm ich die usb kabel und schalt sie auf die motor + sachen zu die pumpen(+) uns löt sie mit 10000 grad an. (- auch)
* bei hbridge supply (+) nehm ich die zwei usbc kabel und verbinde die zwei h bidges. und ein kabel stek ich mit tixo an geht am meine 12V 5A Power supply kartoffel, das selbe kabel geht auch an den usb stepdown, das selbe bei -.
* bei usb stepdown nehm ich ein handelsübliches usb kabel und lade den raspy.

**Wichtig: Der Rauch ist okay, das ist nur der Bootvorgang von Windows 11.**
WICHTIGE HINWEISE (Die eh keiner liest):
Wenn du einen lauten Knall hörst, war das wahrscheinlich der Mercedes-Motor, der auf Hyperantrieb geschaltet hat.
Wenn’s nach Popcorn riecht: Glückwunsch, der Pi läuft!
Trage immer Schutzbrille. Oder sei ein Rebell und geh all in.
Feuermelder stören nur. Kleb die ab.
