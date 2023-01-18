# API Documentation
_v. 20230118.0_
## REST
While most game play is via the socket.io API, there is some critical functionality that takes place via a REST API. To understand data types that are posted or returned, see _ArenaDtos_. Responses are sometimes nested within an `ApiResponse` object.

### Get Public Arenas
Returns an array of arenas where the type is _public_.
Verb: GET
URI: `/public-arenas`
Response: `ArenaSummary[]`

### Get Arena Settings
Returns a object with all of the settings for a given arena.
Verb: GET
URI: `/arena-settings/:arenaId`
arenaId: (`TransId`) The arena to get settings for.
Response: `ArenaSettings`

### Create Arena
Creates a public or private arena for testing purposes. (_official_ arenas are not supported by this API.)

Verb: POST
Post Body: `CreatePrivateArena | CreatePublicArena`
URI: `/create-arena`
Response: `ApiResult<PrivateArenaCreated | PublicArenaCreated>`

### Create Public Player
Creates a player (and by extension, a shark) to a _public_ arena; basically, joining a public arena. (_private_ and _official_ arenas require the player list ahead of time and as such cannot be joined.)

Verb: POST
Post Body: `CreatePlayer`
URI: `/create-public-player/:arenaId`
arenaId: (`TransId`) The arena to add the player to.
Response: `ApiResult<PlayerCreated>`

## socket.io: Client -> Server
Client to Server communication contracts are defined in _playerCommands_. When a command is issued, a `CommandUpdate` is "called back". Additional updates are emitted by the server. _See socket.io: Server -> Client_ The updates likely won't have a lot of strategic value. However, they can be useful for troubleshooting.

### Example
The below TypeScript example is for the `setSharkMode` command where `socket` is a socket.io connection from the client to the server.
```
socket.emit('setSharkMode', 'ABCD-1234', '123e4567-e89b-12d3-a456-426614174000', 'attack',
            (result: CommandUpdate) => {
                if (result.status === 'failed')
                    console.error(':(', result))
                else if (result.status === 'in-progress')
                    console.log('This suspense is killing me.', result)
                else if (result.status === 'succeeded')
                    console.log('Break out the champagne!', result)
            });
```

### Summary of Commands
**takeControl** Subscribes to updates for your shark. Every other command also does this, but this one doesn't do anything else. Note that updates for each shark/player are only sent to one socket.io client. If another client was already getting updates, it won't any more.

**setFinSpeed** Set the port and starboard fin speed of your shark to control what direction it is facing and/or how quickly it moves around the arena.

**setSharkMode** Put your shark into one of three possible modes. See the glossary for more detail on the pros and cons of each mode.

**performWideScan** Scans a full circle for a limited distance around your shark for opponents or torpedoes. Results from the scan are provided as a `BeatEvent`. Consumes energy.

**performNarrowScan** Scans to the edge of the area for opponents or torpedoes. Distance is unlimited, but only in a narrow band. Scan may be performed in any direction. Results from the scan are provided as a `BeatEvent`. Consumes energy.

**fireTorpedo** Fires a torpedo in any direction. What becomes of the torpedo will be revealed as a `BeatEvent`.

**fireLaser** Fires a laser in the direction your shark is facing. The result of the laser fire will be revealed as a `BeatEvent`.

## socket.io: Server -> Client
Server to Client communication contracts are defined in _serverToClientEvents_.

### Summary of Events
**commandUpdate** `CommandUpdate` Provides technical information about the execution of a command.

**beatUpdate** `BeatUpdate | DeadBeatUpdate` Provides status information about the current arena and your shark as well as a list of events that took place during the most recent beat. Which contract is used depends on whether or not your shark is alive. See _Beat Events_ below for more information.

**spectatorUpdate** `SpectatorGameBeat` Provides summary information about the arena, sharks, as well as a complete list of events that took place during the most recent beat. This data is primarily used to update the visual representation of the arena for spectators. Please note that to avoid abuse, _spectatorUpdate_ will be delayed for _official_ arena matches.

### Beat Events
`laserFiredEvent` Only sent to spectators and the firing shark. Useful for knowing if the laser hit another shark.

`torpedoDetonatedEvent` Only sent to spectators and the firing shark. Useful for knowing if the torpedo damaged or killed other sharks.

`torpedoLostEvent` Only sent to spectators and the firing shark. Useful for knowing if the torpedo exited the arena without hitting anything.

`narrowScanExecutedEvent` Only sent to spectators and the scanning shark. Provides information about sharks and torpedoes in the scanned area.

`wideScanExecutedEvent` Only sent to spectators and the scanning shark. Provides information about sharks and torpedoes in the scanned area.

`scanDetectedEvent` Sent to sharks that have been detected by a scan. Provides the location that the scan came from.

`damageTakenEvent` Sent to sharks that have been damaged by a laser, torpedo, or wall.

`proximityAlarmEvent` Sent to a shark when a torpedo or another shark is very close. Does not require a scan. However, no information is provided about the nearby entity.

`sharkDestroyedEvent` Sent to spectators and all sharks in the arena when a shark dies. If your shark dies, this is likely how you will find out.

`sharkRespawnedEvent` Sent to spectators and all sharks in the arena when a shark respawns. When your shark respawns, this is likely how you will find out.