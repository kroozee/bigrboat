# Questions and Responses
_v. 20230118.0_
If you're asking the right questions, you can find responses below.

## Getting Cute
_**I'm really smart and noticed some potential vulnerabilities in the _Sharks-With-Lasers_ service. Would taking advantage of those vulnerabilities make me cool?**_ No.

## Movement
_**What does it mean that the minimum fin speed is a negative number?**_ A negative fin speed on both fins results in the shark going backwards. The effective limitation of minimum fin speed is then how fast the shark can go in reverse and how fast it can turn.

## Scanning
_**My proximity alarm goes off, but when I perform a wide scan there is nothing. How can this be?**_ It's possible that a nearby shark just went into stealth mode or a torpedo was just detonated. Otherwise maybe your proximity range was _clipped_ by a fast-moving torpedo. A proximity alarm only indicates that something is in range, not that it is coming towards you. For that reason, a torpedo could clip the range on the backside of your shark's direction of movement and be out of range by the time your shark performs a wide scan.

## Spectating
_**Why did a shark go gold?**_ A shark turns golden to illustrate that it is on a hot streak.

## Strategy
_**Do we need our clients to be able to handle any combination of ArenaSettings?**_ ArenaSettings won't be changing willy nilly over the course of the competition. However, there may be some tweaks here and there, so like any good piece of software, your AI needs to be adaptable and extensible. For the most part you can count on settings in the _official_ areans being nearly identical to the _public_ and _private_ ones.

_**What would be the reason to change any settings during the competition? Just to mess with us?**_ The Sharks-with-Lasers challenge is meant to be fun, challenging, and competative. Any change would be to further those concepts. Some examples of situations where a change to `ArenaSettings` or the game engine would be made:
1. A very basic or simple strategy is discovered that requires no effort and yet cannot be overcome.
1. A bug or undocumented functionality is found that allows gameplay outside the game creator's intentions.
1. A small, but compelling change is suggested that would make gameplay significantly more interesting.


## Torpedoes
_**My torpedo detonated, but there were no sharks hit. How can this be?**_
Your torpedo was likely detoned by a laser or another torpedo with no other sharks nearby.

_**Can a shark be damaged by it's own torpedo?**_ No and yes. A torpedo will not detonate by hitting the shark that fired it. However, if a torpedo detonates for some other reason and the shark that fired it is within the blast range, that shark will take damage just like any other shark.