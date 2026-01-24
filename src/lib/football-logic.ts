import type { GameState, PlayerState, AiTeam, TableEntry, Fixture, League } from './football-types';
import { FOOTBALL_LEAGUES, PLAYER_TEAM_NAME, INITIAL_PLAYER_STRENGTH } from './football-data';

/**
 * Simulates a football match result based on team strengths and other factors.
 * The first strength parameter is considered the "home" team for bonus purposes.
 */
export function simulateMatch(
  homeStrength: number,
  awayStrength: number,
  homeTrainingBonus: number,
  homeStadiumBonus: boolean
): { homeGoals: number; awayGoals: number } {
    const stadiumBonus = homeStadiumBonus ? homeStrength * 0.15 : 0; // Bonus reduced slightly
    const homeTotalStrength = homeStrength + homeTrainingBonus + stadiumBonus;
    const awayTotalStrength = awayStrength + (Math.random() * 6 - 3); // AI teams get a small random factor

    const strengthDifference = homeTotalStrength - awayTotalStrength;

    let homeGoals = 0;
    let awayGoals = 0;

    if (strengthDifference > 15) { // Big win
        homeGoals = Math.floor(Math.random() * 3) + 2;
        awayGoals = Math.floor(Math.random() * 2);
    } else if (strengthDifference > 5) { // Clear win
        homeGoals = Math.floor(Math.random() * 2) + 1;
        awayGoals = Math.floor(Math.random() * 1.5);
    } else if (strengthDifference > -5) { // Close match / Draw
        homeGoals = Math.floor(Math.random() * 2.5);
        awayGoals = Math.floor(Math.random() * 2.5);
         if (strengthDifference > 0 && Math.random() < 0.2) homeGoals++;
         if (strengthDifference < 0 && Math.random() < 0.2) awayGoals++;
    } else if (strengthDifference > -15) { // Clear loss
        homeGoals = Math.floor(Math.random() * 1.5);
        awayGoals = Math.floor(Math.random() * 2) + 1;
    } else { // Big loss
        homeGoals = Math.floor(Math.random() * 2);
        awayGoals = Math.floor(Math.random() * 3) + 2;
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
export function generateInitialGameState(leagueId: string = 'lpf', playerStrength: number = INITIAL_PLAYER_STRENGTH): GameState {
    const currentLeague = FOOTBALL_LEAGUES.find(l => l.id === leagueId)!;
    
    return {
        player: {
            teamName: PLAYER_TEAM_NAME,
            strength: playerStrength,
            currentLeagueId: leagueId,
            trainingPoints: 0,
            perfectWeekBonus: false,
            seasonHistory: {},
        },
        leagues: FOOTBALL_LEAGUES,
        currentSeason: 1,
        currentMatchday: 1,
        fixtures: generateFixtures(currentLeague.teams, PLAYER_TEAM_NAME),
        table: createInitialTable(currentLeague.teams, PLAYER_TEAM_NAME),
        gameWon: false,
    };
}


/**
 * Simulates a full matchday, updating the table.
 */
export function simulateMatchday(gameState: GameState, trainingPoints: number, isHomeBonus: boolean): GameState {
    const { currentMatchday, fixtures, player, leagues } = gameState;
    let { table } = gameState;

    const matchdayFixtures = fixtures.filter(f => f.matchday === currentMatchday);
    const currentLeague = leagues.find(l => l.id === player.currentLeagueId)!;

    matchdayFixtures.forEach(fixture => {
        if (fixture.result) return;

        const homeIsPlayer = fixture.homeTeamId === player.teamName;
        const awayIsPlayer = fixture.awayTeamId === player.teamName;
        
        const homeTeamData = currentLeague.teams.find(t => t.id === fixture.homeTeamId);
        const awayTeamData = currentLeague.teams.find(t => t.id === fixture.awayTeamId);

        const homeStrength = homeIsPlayer ? player.strength : (homeTeamData?.strength || 70);
        const awayStrength = awayIsPlayer ? player.strength : (awayTeamData?.strength || 70);
        
        const isPlayerMatch = homeIsPlayer || awayIsPlayer;

        const result = simulateMatch(
            homeStrength,
            awayStrength,
            isPlayerMatch ? (homeIsPlayer ? trainingPoints : 0) : Math.floor(Math.random() * 5), 
            isPlayerMatch ? (homeIsPlayer ? isHomeBonus : false) : Math.random() < 0.5
        );
        
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

    return { ...gameState, table: sortedTable, fixtures, currentMatchday: currentMatchday + 1 };
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

    if (finalPosition <= 3) { // Promotion
        nextLeague = leagues.find(l => l.level === currentLeague.level + 1) || currentLeague;
    } else if (finalPosition >= table.length - 2 && currentLeague.level > 1) { // Relegation
        nextLeague = leagues.find(l => l.level === currentLeague.level - 1) || currentLeague;
    } else { // Stay in the same league
        nextLeague = currentLeague;
    }

    const newPlayerStrength = player.strength + (7 - currentLeague.level);
    const newGameState = generateInitialGameState(nextLeague.id, newPlayerStrength);

    newGameState.player.seasonHistory = newHistory;
    newGameState.currentSeason = currentSeason + 1;

    return newGameState;
}
