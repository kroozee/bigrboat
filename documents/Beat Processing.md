# Beat Processing
_v. 20230118.0_


Each beat, the following takes place in order:
1. Increment game clock
1. Apply SharkMode health and/or energy changes
1. Execute FinSpeed commands
1. Move sharks (based on fin speed)
1. Apply out-of-bounds damage
1. Move and detonate torpedoes
1. Execute WideScan commands
1. Execute NarrowScan commands
1. Execute FireLaser commands
1. Execute FireTorpedo commands
1. Regenerate torpedoes
1. Execute SharkMode commands
1. Respawn dead sharks
1. Emit beat updates