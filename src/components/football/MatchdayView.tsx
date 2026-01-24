'use client';

import type { GameState } from '@/lib/football-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MatchdayViewProps {
  gameState: GameState;
  onSimulate: () => void;
}

export function MatchdayView({ gameState, onSimulate }: MatchdayViewProps) {
  const { currentMatchday, fixtures, player, table } = gameState;
  const totalMatchdays = (table.length - 1) * 2;
  const isSeasonOver = currentMatchday > totalMatchdays;

  if (isSeasonOver) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>¡Temporada Terminada!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">Has terminado la temporada. ¡Revisa la tabla final!</p>
          <Button className="mt-4">Comenzar Nueva Temporada</Button>
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
                <CardTitle>Fecha {currentMatchday}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Descansas esta fecha.</p>
                 <Button onClick={onSimulate} className="mt-4 w-full">Simular Día</Button>
            </CardContent>
        </Card>
     )
  }

  const opponentName = playerFixture.homeTeamId === player.teamName ? playerFixture.awayTeamId : playerFixture.homeTeamId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximo Partido: Fecha {currentMatchday}</CardTitle>
        <CardDescription>Completa tus hábitos para fortalecer a tu equipo.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex items-center justify-center gap-4 text-2xl font-bold">
          <div>{playerFixture.homeTeamId}</div>
          <div className="text-muted-foreground">vs</div>
          <div>{playerFixture.awayTeamId}</div>
        </div>
        <Button onClick={onSimulate} className="mt-6 w-full" size="lg">
          Simular Día y Jugar Partido
        </Button>
      </CardContent>
    </Card>
  );
}
