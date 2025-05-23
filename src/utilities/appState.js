import Constants from '../Constants'

export const roster = {
    grandAlliance: '',
    allegiance: '',
    regiments: [
        {
            units: [],
            heroId: '',
            points: 0,
            artefact: '',
            heroicTrait: ''
        }
    ],
    generalRegimentIndex: null,
    auxiliaryUnits: [],
    regimentOfRenown: null,
    regimentsOfRenownUnits: [],
    battleFormation: '',
    withoutBattleFormation: false,
    spellsLore: '',
    prayersLore: '',
    manifestationLore: '',
    manifestationsList: [],
    factionTerrain: '',
    pointsLimit: 2000,
    points: 0
}

export const search = {
    value: '',
    Warscrolls: [],
    Rules: [],
    Allegiances: [],
    expand: {
        Warscrolls: true,
        Rules: true,
        Allegiances: true
    },
    rostersValue: '',
    rosters: [],
    playersValue: '',
    players: []
}

export const builderFilters = {
    hidePotentialLegends: false,
    showLegends: false
}

export const singlePlayer = {
    firstPlayer: {...Constants.newPlayer},
    secondPlayer: {...Constants.newPlayer},
    battleplan: {
        name: '',
        id: ''
    },
    rounds: [],
    currentRound: 1,
    gameStarted: false,
    gameOver: false,
    underdog: 0
}

export const calc = {
    units: [{...Constants.newCalcUnit}]
}

export const navigationState = {
    isBuilder: false
}

export const player = {
    roster: '',
    reg: false,
    isRequested: false
}

export const players = {
    data: [],
    rosters: []
}

export const rostersStuck = {
    count: 0
}

export const rounds = {
    selected: 1,
    stuckCount: 0
}

export const fetching = {
    main: true
}

export const meta = {
    round: 0,
    isRoundActive: 0
}

export const rosterViewType = {
    easy: false
}
