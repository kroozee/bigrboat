# Arena Settings
_v. 20230118.0_

The `ArenaSettings` object provides values used for executing the logic of the game. Below is an explantation of some of the values and how they are used by the game engine.

###`type`
: The type of arena. Here is a summary of what each type means:
| Type         | Description |
|--------------|-------------------------------------------------------------------------------|
| **Public**   | Can be created via the API. Players join whenever. Can be queried.            |
| **Private**  | Can be created via the API. Players set up at create time. Cannot be queried. |
| **Official** | Created via magic. Players set up at create time. Cannot be queried.          |

###`gameLength`
 How much time (in beats) sharks have to play the game and score points.

###`dimensions`
 The size of the arena in distance units.

###`spectatorDelay`
 The distance, in light-beats, that spectators are from the actual game.

###`trashTalk.responseTime`
 The time your shark has to respond to a trash talk opportunity before it expires.

###`trashTalk.maxMessageLength`
 The upper limit of classy characters in your classy trash talk.

###`shark.goldKillCount`
 A shark with a kill streak greater than or equal to this number will display as gold in the spectator view.

###`shark.fins.crippledSpeedReduction`
 The reduction to finSpeed when a shark is in a crippled state. In other words, when your shark's health is low, it will move more slowly than what you tell it to.

###`shark.fins.immobilizedSpeedReduction`
 The reduction to finSpeed when a shark is in an immobilized state.

###`shark.dimensions`
 The size of the shark. Height is head to tail. Width is fin to fin.

###`torpedo.regenFrequency`
 How often torpedoes are replaced. Only sharks that have less than _torpedo.maxCount_ will get one.

###`torpedo.explosionRange`
 The radius of damage from the torpedo's center point when it detonates.

###`torpedo.explosionToll`
 What is will cost your shark if it finds itself within a torpedo's _torpedo.explosionRange_.

###`laser.firingToll`
 What is will cost your shark to fire your laser.

###`laser.hitToll`
 What is will cost your shark to be hit by a laser.

###`scan.proximityAlarmRange`
 How close a torpedo or shark needs to be to your shark in order to set off the proximity alarm.

###`scan.wideRange`
 How close a torpedo or shark needs to be to your shark in order to be detected by a wide scan.

###`scan.wideToll`
 What is will cost your shark to perform a wide scan.

###`scan.narrowBand`
 The band (in rads) that is covered by a narrow scan.

###`scan.narrowScanToll`
 What is will cost your shark to perform a narrow scan.

###`outOfBoundsToll`
 What it will cost your shark to be out of bounds for one beat of time.

###`deathTimePenalty`
 Values used for a calculation to determine how many beats from when your shark dies to when it will respawn. The calculation is: `base * previousNumberOfDeaths^perAdditionalMultiplier`

###`modeBeatToll`
 What it will cost or provide your shark each beat to be in a specific mode.

###`scoring.perLivingBeat`
 The number of points your shark scores each beat just for being alive.

###`scoring.perHealthDamageInflicted`
 The number of points your shark scores for each unit of health lost by another shark when hit by your shark's weapons.

###`scoring.bounty`
 Values used for a calculation to determine how many points a shark scores when it finishes off another shark. The calculation is: `min(max, base * numberOfUnansweredKills^perAdditionalMultiplier)`