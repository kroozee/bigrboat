# Glossary
_v. 20230118.0_
If you're wondering, _What does it all mean?_ then this is a good place to start. **Please note**: These terms are in alphabetical order so you may need to jump around a bit.

## In Game
**Arena**: A space within a shallow pool where the sharks do battle. The boarders of the arena are marked by deadly lasers.

**Beat**: The standard unit of time for a shark. The beat corresponds to the frequency of alpha waves in a genetically engineered shark's brain to ensure maximum effectiveness of the electrodes.

**Death**: If you don't have your health, you don't have anything. Also, you are dead. Dead sharks don't accumulate points. Don't worry though, a dead shark will respawn after a time. The amount of time that a shark remains dead before respawning increases with each death.

**Golden**: Scientists casually refer to a shark as _golden_ if it has numerous unanswered kills.

**Laser**: Not a true laser, as this would be an ineffective weapon when used under water. Instead this weapon employs a highly-focused version of the snapping mechanism used by pistol shrimp. _Lasers_ require a fair amount of energy to fire and do less damage than a torpedo, but they can be used to bring instant lethality to an enemy shark or torpedo at any distance within the arena. Unlike torpedoes, lasers can only fire in the direction that the shark is facing.

**Repair Mode**: Medical-grade nanobots can be released at any time by a shark to repair injuries much more quickly and completely than they naturally would otherwise. The bots consume 100% of a shark's energy regeneration, and like any medical professional, the nanobots require the patient to _hold still_ so they can do their work effectively.

**Scanning**: To make up for their lack of sight, each shark has a sophisticated sonar-transmitting-and-receiving device. The device can be used to scan in a complete circle for a small distance around the shark or at a longer distance in one direction. Sharks' onboard computers can analyze the sonar data to determine location, velocity, and identifying information about sharks and torpedoes.

**Shark**: A genetically engineered elasmobranchii fish capable of using sonar, carrying torpedoes, and firing lasers. Sharks are blind and mindlessly follow instructions given to them via electrodes implanted into their brains.

**Stealth Mode**: Sharks are equipped with a sound-absorbing skin that, when activated, makes them _transparent_ to sonar. Unfortunately, the technology is  bleeding edge (literally) and a bit hazardous to a shark's health.

**Trash Talk**: Despite their loss of agency, mindless sharks have a tendancy to blurt out trashy comments once in a while. This can have a negative impact on the scientific process. Fortunately this tendancy can be countered by implanting classy messages into their brains via implanted electrodes.

**Torpedo**: The most deadly weapon in a shark's arsenal. Torpedoes travel through the water much faster than sharks, but they aren't instantaneous the way lasers are. When a torpedo detonates, it sends a shock wave through the water damaging everything nearby. A single shark can only carry two torpedoes. However, mechanical arms above the arena pool periodically replace spent torpedoes.

## Technical

**Beat**: A processing workflow of the game engine. See _beatProcessing.md_ for the order of operations. There is no guarantee how much real time passes between beats. However, the game engine attempts to keep the beat frequency at an average of 12Hz.

**Bounty**: Bonus points awarded to one shark when it destroys another. The bounty for a shark grows as it kills other sharks without dying and is based on the values in ``ArenaSettings.scoring.bounty``. The formula is as follows: ``min(bounty.max, bounty.base * bounty.perAdditionalMultiplier^killsSinceLastDeath)``

**DeadShark**: A shark is a _DeadShark_ when it has health of zero. Dead sharks do not accumulate points or participate in arena combat. A dead shark will eventually respawn, meaning that it is no longer dead. The amount of time a shark remains dead is based on values in ``ArenaSettings.deathTimePenalty`` The formula is as follows: ``deathTimePenalty.base * deathTimePenalty.perAdditionalMultiplier^Shark.diedCount``

**HealthStatus**: An imprecise measurement of a shark's health as revealed by a scan. A shark with more than 40% of maximum health is considered _healthy_. 10% or less of maximum health is _immobilized_, and anything in-between is _crippled_.

**NarrowScan**: Reveals the non-stealth sharks in a narrow band away from the shark. The angular width value of the scan is ``ArenaSettings.scan.narrowBand``

**PlayerId**: A UUID to identify who is controlling a shark. PlayersIds should be closely-held secrets. Not knowing someone's PlayerId is all that keeps your opponents from taking control of your shark.

**Points**: Points are a running total for a shark within an arena. Points are awarded for staying alive, damaging other sharks, and via a bounty awarded when killing another shark. For specific values, see ``ArenaSettings.scoring``

**SharkId**: A ``TransId`` that uniquely identifies a shark. A shark keeps the same SharkId through its [potentially] many lives and deaths.

**SharkMode**: The operating mode of a living shark. Each mode (_attack_, _repair_, and _stealth_) has advantages and disadvantages. Here is a summary:

| Mode        | Health    | Energy    | Scan | Be scanned | Weapons | Movement |
|-------------|-----------|-----------|------|------------|---------|----------|
| **Attack**  | no change | increases | yes  | yes        | yes     | yes      |
| **Repair**  | increases | no change | yes  | yes        | no      | no       |
| **Stealth** | decreases | no change | no   | no         | no      | yes      |


**TransId**: A value to uniquely identify and relate objects and events within the game. The format is two sets of four characters with a dash in the middle. Each character may be a number or an upper-case English letter. The following letters are excluded: _I L O S Z_

**WideScan**: Reveals the non-stealth sharks in a circle around a shark. The radius value of the circle is ``ArenaSettings.scan.wideRange``