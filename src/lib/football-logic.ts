import type { GameState, PlayerState, AiTeam, TableEntry, Fixture, League } from './football-types';
import { FOOTBALL_LEAGUES, PLAYER_TEAM_NAME, INITIAL_PLAYER_STRENGTH } from './football-data';

/**
 * Simulates a football match result based on team strengths and other factors.
 */
export function simulateMatch(
  playerStrength: number,
  opponentStrength: number,
  trainingPoints: number,
  isHomeBonus: boolean
): { playerGoals: number; opponentGoals: number } {
    const homeBonus = isHomeBonus ? playerStrength * 0.20 : 0;
    const playerTotalStrength = playerStrength + trainingPoints + homeBonus;
    const opponentTotalStrength = opponentStrength + (Math.random() * 10 - 5);

    const strengthDifference = playerTotalStrength - opponentTotalStrength;

    let playerGoals = 0;
    let opponentGoals = 0;

    if (strengthDifference > 15) { // Big win
        playerGoals = Math.floor(Math.random() * 3) + 2;
        opponentGoals = Math.floor(Math.random() * 2);
    } else if (strengthDifference > 5) { // Clear win
        playerGoals = Math.floor(Math.random() * 2) + 1;
        opponentGoals = Math.floor(Math.random() * 1);
    } else if (strengthDifference > -5) { // Close match / Draw
        const goals = Math.floor(Math.random() * 3);
        playerGoals = goals;
        opponentGoals = goals;
        if (Math.random() < 0.33 && playerTotalStrength > opponentTotalStrength) playerGoals++;
        else if (Math.random() < 0.5) opponentGoals++;
    } else if (strengthDifference > -15) { // Clear loss
        playerGoals = Math.floor(Math.random() * 1);
        opponentGoals = Math.floor(Math.random() * 2) + 1;
    } else { // Big loss
        playerGoals = Math.floor(Math.random() * 2);
        opponentGoals = Math.floor(Math.random() * 3) + 2;
    }
    
    return { playerGoals: Math.max(0, playerGoals), opponentGoals: Math.max(0, opponentGoals) };
}

/**
 * Generates fixtures for a round-robin tournament (single leg).
 */
function generateFixtures(teams: string[]): Fixture[] {
    const fixtures: Fixture[] = [];
    const numTeams = teams.length;
    if (numTeams % 2 !== 0) teams.push('dummy'); // Handle odd number of teams

    for (let matchday = 0; matchday < numTeams - 1; matchday++) {
        for (let i = 0; i < numTeams / 2; i++) {
            const homeTeam = teams[i];
            const awayTeam = teams[numTeams - 1 - i];
            
            if (homeTeam !== 'dummy' && awayTeam !== 'dummy') {
                 // Alternate home/away for fairness
                if (matchday % 2 === 0) {
                    fixtures.push({ matchday: matchday + 1, homeTeamId: homeTeam, awayTeamId: awayTeam });
                } else {
                    fixtures.push({ matchday: matchday + 1, homeTeamId: awayTeam, awayTeamId: homeTeam });
                }
            }
        }
        // Rotate teams for next matchday
        teams.splice(1, 0, teams.pop()!);
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
    const allTeamIds = [...currentLeague.teams.map(t => t.id), PLAYER_TEAM_NAME];

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
        fixtures: generateFixtures(allTeamIds),
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
        if (fixture.result) return; // Already played

        const homeIsPlayer = fixture.homeTeamId === player.teamName;
        const awayIsPlayer = fixture.awayTeamId === player.teamName;
        
        const homeTeamStrength = homeIsPlayer ? player.strength : currentLeague.teams.find(t => t.id === fixture.homeTeamId)!.strength;
        const awayTeamStrength = awayIsPlayer ? player.strength : currentLeague.teams.find(t => t.id === fixture.awayTeamId)!.strength;
        
        const { playerGoals, opponentGoals } = simulateMatch(
            homeIsPlayer ? homeTeamStrength : awayTeamStrength,
            homeIsPlayer ? awayTeamStrength : homeTeamStrength,
            (homeIsPlayer || awayIsPlayer) ? trainingPoints : 0, // Only player gets training bonus
            homeIsPlayer && isHomeBonus // Home bonus only for player at home
        );

        const homeGoals = homeIsPlayer ? playerGoals : opponentGoals;
        const awayGoals = awayIsPlayer ? playerGoals : opponentGoals;
        
        fixture.result = { homeGoals, awayGoals };

        // Update table
        const homeEntry = table.find(e => e.teamId === fixture.homeTeamId)!;
        const awayEntry = table.find(e => e.teamId === fixture.awayTeamId)!;
        
        homeEntry.played++;
        awayEntry.played++;
        homeEntry.goalsFor += homeGoals;
        awayEntry.goalsFor += awayGoals;
        homeEntry.goalsAgainst += awayGoals;
        awayEntry.goalsAgainst += homeGoals;
        homeEntry.goalDifference = homeEntry.goalsFor - homeEntry.goalsAgainst;
        awayEntry.goalDifference = awayEntry.goalsFor - awayEntry.goalsAgainst;

        if (homeGoals > awayGoals) {
            homeEntry.wins++;
            homeEntry.points += 3;
            awayEntry.losses++;
        } else if (awayGoals > homeGoals) {
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

    table = table.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);

    return { ...gameState, table, fixtures, currentMatchday: currentMatchday + 1 };
}
