'use client';

import type { GameState } from '@/lib/football-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MatchdayViewProps {
  gameState: GameState;
  onSimulate: () => void;
  onNextSeason: () => void;
  isSeasonOver: boolean;
}

export function MatchdayView({ gameState, onSimulate, onNextSeason, isSeasonOver }: MatchdayViewProps) {
  const { currentMatchday, fixtures, player, leagues } = gameState;
  const currentLeague = leagues.find(l => l.id === player.currentLeagueId)!;

  const getTeamName = (teamId: string) => {
    if (teamId === player.teamName) {
        return player.teamName;
    }
    return currentLeague.teams.find(t => t.id === teamId)?.name || teamId;
  };

  if (isSeasonOver) {
    return (
      <Card className="text-center bg-primary/10">
        <CardHeader>
          <CardTitle>¡Temporada Terminada!</CardTitle>
          <CardDescription>Revisa la tabla final para ver tu posición. ¡Prepárate para lo que viene!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onNextSeason} className="w-full" size="lg">
            Comenzar Siguiente Temporada
          </Button>
        </CardContent>
      </Card>
    );
  }

  const playerFixture = fixtures.find(
    (f) => f.matchday === currentMatchday && (f.homeTeamId === player.teamName || f.awayTeamId === player.teamName)
  );
  
  if (!playerFixture) {
     return (
         <Card>
            <CardHeader>
                <CardTitle>Fecha {currentMatchday} - Descanso</CardTitle>
                <CardDescription>Tu equipo no juega esta jornada. Aprovecha para planificar la estrategia.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button onClick={onSimulate} className="mt-4 w-full">Simular Resto de la Jornada</Button>
            </CardContent>
        </Card>
     )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximo Partido: Fecha {currentMatchday}</CardTitle>
        <CardDescription>Completa tus hábitos para fortalecer a tu equipo antes del gran día.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex items-center justify-center gap-4 text-2xl font-bold my-4">
          <div className="flex-1 text-right">{getTeamName(playerFixture.homeTeamId)}</div>
          <div className="text-muted-foreground">vs</div>
          <div className="flex-1 text-left">{getTeamName(playerFixture.awayTeamId)}</div>
        </div>
        <Button onClick={onSimulate} className="mt-6 w-full" size="lg">
          Simular Día y Jugar Partido
        </Button>
      </CardContent>
    </Card>
  );
}
