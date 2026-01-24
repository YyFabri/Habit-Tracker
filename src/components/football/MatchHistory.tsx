'use client';

import type { GameState, Fixture } from '@/lib/football-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface MatchHistoryProps {
  gameState: GameState;
}

export function MatchHistory({ gameState }: MatchHistoryProps) {
  const { fixtures, player, leagues } = gameState;
  
  const playedPlayerFixtures = fixtures
    .filter(f => f.result && (f.homeTeamId === player.teamName || f.awayTeamId === player.teamName))
    .sort((a, b) => b.matchday - a.matchday);

  if (playedPlayerFixtures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Partidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">Aún no se han jugado partidos esta temporada.</p>
        </CardContent>
      </Card>
    );
  }

  const currentLeague = leagues.find(l => l.id === player.currentLeagueId)!;
  const getTeamName = (teamId: string) => {
    if (teamId === player.teamName) {
      return player.teamName;
    }
    return currentLeague.teams.find(t => t.id === teamId)?.name || teamId;
  };
  
  const getResultBadge = (fixture: Fixture) => {
    if (!fixture.result) return null;
    const isPlayerHome = fixture.homeTeamId === player.teamName;
    const playerGoals = isPlayerHome ? fixture.result.homeGoals : fixture.result.awayGoals;
    const opponentGoals = isPlayerHome ? fixture.result.awayGoals : fixture.result.homeGoals;
    
    if (playerGoals > opponentGoals) return <Badge variant="default" className="bg-green-500 hover:bg-green-500/80">V</Badge>;
    if (playerGoals < opponentGoals) return <Badge variant="destructive">D</Badge>;
    return <Badge variant="secondary">E</Badge>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Partidos</CardTitle>
        <CardDescription>Resultados de la temporada actual.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Fecha</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="w-24 text-center">Resultado</TableHead>
                <TableHead>Visitante</TableHead>
                 <TableHead className="w-12 text-center"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playedPlayerFixtures.map((fixture) => (
                <TableRow key={`${fixture.matchday}-${fixture.homeTeamId}`}>
                  <TableCell>{fixture.matchday}</TableCell>
                  <TableCell className={fixture.homeTeamId === player.teamName ? 'font-bold' : ''}>{getTeamName(fixture.homeTeamId)}</TableCell>
                  <TableCell className="text-center font-mono">
                    {fixture.result!.homeGoals} - {fixture.result!.awayGoals}
                  </TableCell>
                  <TableCell className={fixture.awayTeamId === player.teamName ? 'font-bold' : ''}>{getTeamName(fixture.awayTeamId)}</TableCell>
                   <TableCell className="text-center">{getResultBadge(fixture)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
