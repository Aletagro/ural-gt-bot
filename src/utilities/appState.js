import Constants from '../Constants'

export const roster = {
    grandAlliance: '',
    allegiance: '',
    regiments: [
        {
            units: [],
            heroId: '',
            points: 0
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
    points: {
        all: 0
    },
    tactics: [],
    otherEnhancement: undefined
}

export const search = {
    value: '',
    Warscrolls: [],
    Rules: [],
    Allegiances: [],
    'Battle Formation': [],
    Abilities: [],
    'Lore Abilities': [],
    'Regiment of Renown': [],
    expand: {
        Warscrolls: true,
        Rules: true,
        Allegiances: true,
        'Battle Formation': true,
        Abilities: true,
        'Lore Abilities': true,
        'Regiment of Renown': true
    }
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

export const isCollapseUnitsTypes = Constants.defaultIsCollapseUnitsTypes

export const isCollapseRegimentAlliances = Constants.defaultIsCollapseRegimentAlliances

export const lists = {
    count: 0,
    data: []
}
