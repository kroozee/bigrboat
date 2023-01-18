export const arenaTypes = ['private', 'public', 'official'] as const;
export type ArenaType = typeof arenaTypes[number];

export type ArenaSummary = {
    arenaId: string
    type: ArenaType
    gameLength: number
    gameClock: number
    dimensions: {
        width: number
        height: number
    }
    playerCount: number
}

export type ArenaSettings = {
    arenaId: string
    type: ArenaType
    countdownToStart: number
    gameLength: number
    dimensions: {
        width: number
        height: number
    }
    spectatorDelay: number
    trashTalk: {
        responseTime: number,
        maxMessageLength: number
    }
    shark: {
        goldKillCount: number
        fins: {
            minSpeed: number
            maxSpeed: number
            crippledSpeedReduction: number
            immobilizedSpeedReduction: number
        }
        dimensions: {
            width: number
            height: number
        }
        health: {
            starting: number
            max: number
        }
        energy: {
            starting: number
            max: number
        }          
    }
    torpedo: {
        startingCount: number
        maxCount: number
        regenFrequency: number
        speed: number
        explosionRange: number
        explosionToll: HealthAndEnergyChange
    }
    laser: {
        firingToll: HealthAndEnergyChange
        hitToll: HealthAndEnergyChange
    }
    scan: {
        proximityAlarmRange: number // distance
        wideRange: number // distance
        wideToll: HealthAndEnergyChange
        narrowBand: number // angle
        narrowScanToll: HealthAndEnergyChange
    }    
    outOfBoundsToll: HealthAndEnergyChange
    deathTimePenalty: { // base * previousNumberOfDeaths^perAdditionalMultiplier
        base: number
        perAdditionalMultiplier: number
    }
    modeBeatToll: {
        attackMode: HealthAndEnergyChange
        repairMode: HealthAndEnergyChange
        stealthMode: HealthAndEnergyChange
    }
    scoring: {
        
        perLivingBeat: number        
        perHealthDamageInflicted: number
        bounty: { // base * numberOfUnansweredKills^perAdditionalMultiplier
            base: number
            perAdditionalMultiplier: number
            max: number
        }
    }
}

export type CreatePublicArena = {
    arenaType: 'public'
    countdownToStart: number
    gameLength: number
}

export type PublicArenaCreated = {
    arenaId: string
    arenaType: 'public'
}

export type CreatePrivateArena = {
    arenaType: 'private'
    countdownToStart: number
    gameLength: number
    players: CreatePlayer[]
}

export type PrivateArenaCreated = {
    arenaId: string
    arenaType: 'private'
    players: PlayerCreated[]
}

export type PlayerCreated = {
    playerId: string
    sharkId: string
    name: string
    color: string
}

export type CreatePlayer = {
    sharkName: string
}

export type HealthAndEnergyChange = {
    change:number;
}