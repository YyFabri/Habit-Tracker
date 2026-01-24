import type { GameState, PlayerState, AiTeam, TableEntry, Fixture, League } from './football-types';
import { FOOTBALL_LEAGUES } from './football-data';

/**
 * Simulates a football match result based on team strengths and other factors.
 */
function simulateMatch(
  homeEffectiveStrength: number,
  awayEffectiveStrength: number,
): { homeGoals: number; awayGoals: number } {
    const strengthDifference = homeEffectiveStrength - awayEffectiveStrength;

    let homeGoals = 0;
    let awayGoals = 0;

    // More volatile results for more excitement
    if (strengthDifference > 15) { // Big win
        homeGoals = Math.floor(Math.random() * 3) + 2; // 2-4 goals
        awayGoals = Math.floor(Math.random() * 2);   // 0-1 goals
    } else if (strengthDifference > 5) { // Clear win
        homeGoals = Math.floor(Math.random() * 2) + 1; // 1-2 goals
        awayGoals = Math.floor(Math.random() * 1.5);  // 0-1 goals
    } else if (strengthDifference > -5) { // Close match / Draw
        homeGoals = Math.floor(Math.random() * 2.5); // 0-2 goals
        awayGoals = Math.floor(Math.random() * 2.5); // 0-2 goals
         if (strengthDifference > 2 && Math.random() < 0.25) homeGoals++; // Slight edge matters
         if (strengthDifference < -2 && Math.random() < 0.25) awayGoals++;
    } else if (strengthDifference > -15) { // Clear loss
        homeGoals = Math.floor(Math.random() * 1.5); // 0-1 goals
        awayGoals = Math.floor(Math.random() * 2) + 1; // 1-2 goals
    } else { // Big loss
        homeGoals = Math.floor(Math.random() * 2);   // 0-1 goals
        awayGoals = Math.floor(Math.random() * 3) + 2; // 2-4 goals
    }
    
    return { homeGoals: Math.max(0, homeGoals), awayGoals: Math.max(0, awayGoals) };
}


/**
 * Generates fixtures for a round-robin tournament (single leg).
 */
function generateFixtures(teams: AiTeam[], playerTeamName: string): Fixture[] {
    let teamIds = [...teams.map(t => t.id), playerTeamName];
    const fixtures: Fixture[] = [];
    const numTeams = teamIds.length;
    
    if (numTeams % 2 !== 0) {
        teamIds.push('dummy');
    }
    const rounds = teamIds.length - 1;

    for (let round = 0; round < rounds; round++) {
        for (let i = 0; i < teamIds.length / 2; i++) {
            const home = teamIds[i];
            const away = teamIds[teamIds.length - 1 - i];
            if (home !== 'dummy' && away !== 'dummy') {
                 const isHome = i === 0 ? round % 2 !== 0 : Math.random() > 0.5;
                 fixtures.push({
                    matchday: round + 1,
                    homeTeamId: isHome ? home : away,
                    awayTeamId: isHome ? away : home,
                });
            }
        }
        teamIds.splice(1, 0, teamIds.pop()!);
    }
    return fixtures;
}

/**
 * Creates an initial table for the league.
 */
function createInitialTable(teams: AiTeam[], playerTeamName: string): TableEntry[] {
    const entries: TableEntry[] = teams.map(team => ({
        teamId: team.id,
        teamName: team.name,
        isPlayer: false, played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    }));
    entries.push({
        teamId: playerTeamName,
        teamName: playerTeamName,
        isPlayer: true, played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    });
    return entries;
}

/**
 * Initializes the game state for a new game or a new season.
 */
export function generateInitialGameState(playerName: string, leagueId: string = 'lpf', playerStrength: number = 40, playerMorale: number = 50): GameState {
    const currentLeague = FOOTBALL_LEAGUES.find(l => l.id === leagueId)!;
    
    return {
        player: {
            teamName: playerName,
            strength: playerStrength,
            currentLeagueId: leagueId,
            trainingPoints: 0,
            perfectWeekBonus: false,
            morale: playerMorale,
            seasonHistory: {},
        },
        leagues: FOOTBALL_LEAGUES,
        currentSeason: 1,
        currentMatchday: 1,
        fixtures: generateFixtures(currentLeague.teams, playerName),
        table: createInitialTable(currentLeague.teams, playerName),
        gameWon: false,
    };
}


/**
 * Simulates a full matchday, updating the table.
 */
export function simulateMatchday(gameState: GameState, trainingPoints: number, isHomeBonus: boolean): GameState {
    const { currentMatchday, fixtures, player, leagues } = gameState;
    let { table } = gameState;

    // 1. Update Morale based on training
    let newMorale = player.morale;
    if (trainingPoints > 0) {
        newMorale += 5; // Increase morale for completing habits
    } else {
        newMorale -= 3; // Decrease morale for not training
    }
    newMorale = Math.max(0, Math.min(100, newMorale)); // Cap morale between 0 and 100

    // 2. Calculate player's effective strength for this matchday
    const moraleBonus = (newMorale - 50) / 5; // From -10 to +10 bonus
    const playerEffectiveStrength = player.strength + moraleBonus + trainingPoints;

    const matchdayFixtures = fixtures.filter(f => f.matchday === currentMatchday);
    const currentLeague = leagues.find(l => l.id === player.currentLeagueId)!;

    matchdayFixtures.forEach(fixture => {
        if (fixture.result) return;

        const homeIsPlayer = fixture.homeTeamId === player.teamName;
        const awayIsPlayer = fixture.awayTeamId === player.teamName;
        
        const homeTeamData = currentLeague.teams.find(t => t.id === fixture.homeTeamId);
        const awayTeamData = currentLeague.teams.find(t => t.id === fixture.awayTeamId);

        // 3. Calculate final strength for home and away teams
        let homeStrength = homeIsPlayer ? playerEffectiveStrength : (homeTeamData?.strength || 70) + (Math.random() * 5);
        let awayStrength = awayIsPlayer ? playerEffectiveStrength : (awayTeamData?.strength || 70) + (Math.random() * 5);

        // Apply home bonus
        const homeStadiumBonusMultiplier = 1.20; // 20% bonus
        if (homeIsPlayer && isHomeBonus) {
            homeStrength *= homeStadiumBonusMultiplier;
        } else if (!homeIsPlayer && Math.random() < 0.3) { // AI teams also get home bonus sometimes
            homeStrength *= 1.10;
        }
        
        // 4. Simulate match with final calculated strengths
        const result = simulateMatch(homeStrength, awayStrength);
        
        fixture.result = { homeGoals: result.homeGoals, awayGoals: result.awayGoals };

        const homeEntry = table.find(e => e.teamId === fixture.homeTeamId)!;
        const awayEntry = table.find(e => e.teamId === fixture.awayTeamId)!;
        
        homeEntry.played++;
        awayEntry.played++;
        homeEntry.goalsFor += result.homeGoals;
        awayEntry.goalsFor += result.awayGoals;
        homeEntry.goalsAgainst += result.awayGoals;
        awayEntry.goalsAgainst += result.homeGoals;
        homeEntry.goalDifference = homeEntry.goalsFor - homeEntry.goalsAgainst;
        awayEntry.goalDifference = awayEntry.goalsFor - awayEntry.goalsAgainst;

        if (result.homeGoals > result.awayGoals) {
            homeEntry.wins++;
            homeEntry.points += 3;
            awayEntry.losses++;
        } else if (result.awayGoals > result.homeGoals) {
            awayEntry.wins++;
            awayEntry.points += 3;
            homeEntry.losses++;
        } else {
            homeEntry.draws++;
            awayEntry.draws++;
            homeEntry.points += 1;
            awayEntry.points += 1;
        }
    });

    const sortedTable = [...table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);

    const updatedPlayer = { ...player, morale: newMorale };

    return { ...gameState, player: updatedPlayer, table: sortedTable, fixtures, currentMatchday: currentMatchday + 1 };
}

/**
 * Handles end-of-season logic, including promotion and relegation.
 */
export function startNewSeason(currentState: GameState): GameState {
    const { player, leagues, currentSeason, table } = currentState;

    const finalPosition = table.findIndex(e => e.teamId === player.teamName) + 1;
    const newHistory = { ...player.seasonHistory, [currentSeason]: { leagueId: player.currentLeagueId, finalPosition } };

    const currentLeague = leagues.find(l => l.id === player.currentLeagueId)!;
    
    // WIN CONDITION: Win the top-level league
    if (currentLeague.level === leagues.length && finalPosition === 1) {
        return {
            ...currentState,
            player: { ...player, seasonHistory: newHistory },
            gameWon: true,
        };
    }

    let nextLeague: League;
    let strengthBonus = 0;

    if (finalPosition <= 3) { // Promotion
        nextLeague = leagues.find(l => l.level === currentLeague.level + 1) || currentLeague;
        strengthBonus = 5; // Bonus for promotion
    } else if (finalPosition >= table.length - 2 && currentLeague.level > 1) { // Relegation
        nextLeague = leagues.find(l => l.level === currentLeague.level - 1) || currentLeague;
        strengthBonus = 1; // Small pity bonus
    } else { // Stay in the same league
        nextLeague = currentLeague;
        strengthBonus = 2; // Bonus for holding your ground
    }

    const newPlayerStrength = player.strength + strengthBonus;
    const newGameState = generateInitialGameState(player.teamName, nextLeague.id, newPlayerStrength, player.morale);

    newGameState.player.seasonHistory = newHistory;
    newGameState.currentSeason = currentSeason + 1;

    return newGameState;
}
