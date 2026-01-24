'use client';

import { useState, useEffect } from 'react';
import type { GameState } from '@/lib/football-types';
import { generateInitialGameState, simulateMatchday, startNewSeason } from '@/lib/football-logic';
import { FootballHeader } from '@/components/football/FootballHeader';
import { LeagueTable } from '@/components/football/LeagueTable';
import { MatchdayView } from '@/components/football/MatchdayView';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function WinScreen({ gameState, onReset }: { gameState: GameState, onReset: () => void }) {
    const { player, leagues } = gameState;
    const history = Object.entries(player.seasonHistory);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <FootballHeader />
            <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <div className="p-6 rounded-full bg-primary/20 mb-6">
                    <span className="text-7xl">🏆</span>
                </div>
                <h1 className="text-5xl font-bold text-primary">¡CAMPEÓN DE CAMPEONES!</h1>
                <p className="mt-4 text-2xl max-w-2xl">
                    ¡Has conquistado la cima del fútbol! Llevaste a tu equipo desde la división más baja hasta la gloria de la Premier League.
                </p>
                <p className="mt-2 text-muted-foreground">Tu disciplina y estrategia te han convertido en una leyenda.</p>
                
                <Card className="mt-8 w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Tu Trayectoria Legendaria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Temporada</TableHead>
                                    <TableHead>Liga</TableHead>
                                    <TableHead className="text-right">Posición Final</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map(([season, data]) => (
                                    <TableRow key={season}>
                                        <TableCell>{season}</TableCell>
                                        <TableCell>{leagues.find(l => l.id === data.leagueId)?.name}</TableCell>
                                        <TableCell className="text-right">{data.finalPosition}º</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Button onClick={onReset} className="mt-8" size="lg">
                    Empezar una Nueva Carrera
                </Button>
            </main>
        </div>
    );
}


export default function FootballPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedState = localStorage.getItem('footballGameState');
      if (savedState) {
        setGameState(JSON.parse(savedState));
      } else {
        setGameState(generateInitialGameState());
      }
    } catch (error) {
      console.error("Failed to load football game state:", error);
      setGameState(generateInitialGameState());
    }
  }, []);

  useEffect(() => {
    if (isClient && gameState) {
      localStorage.setItem('footballGameState', JSON.stringify(gameState));
    }
  }, [gameState, isClient]);

  const handleSimulateDay = () => {
    if (!gameState) return;
    
    // In a real scenario, you'd fetch this from the habits page
    const dailyTrainingPoints = Math.floor(Math.random() * 10);
    const isHomeBonus = Math.random() < 0.2; // Placeholder for perfect week bonus

    setGameState(simulateMatchday(gameState, dailyTrainingPoints, isHomeBonus));
  };
  
  const handleResetGame = () => {
     if (window.confirm("¿Estás seguro de que quieres reiniciar tu carrera? Perderás todo tu progreso.")) {
        localStorage.removeItem('footballGameState');
        setGameState(generateInitialGameState());
     }
  }

  const handleNextSeason = () => {
    if (!gameState) return;
    if (window.confirm("¿Estás listo para empezar la siguiente temporada?")) {
        setGameState(startNewSeason(gameState));
    }
  }

  if (!isClient || !gameState) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <FootballHeader />
            <main className="flex-grow p-4 md:p-6 space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-48 w-full" />
                <div className="grid md:grid-cols-3 gap-6">
                    <Skeleton className="h-96 w-full md:col-span-2" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </main>
        </div>
    );
  }

  if (gameState.gameWon) {
      return <WinScreen gameState={gameState} onReset={handleResetGame} />;
  }
  
  const { table, currentMatchday, fixtures, player, leagues, currentSeason } = gameState;
  const currentLeague = leagues.find(l => l.id === player.currentLeagueId);
  const totalMatchdays = (currentLeague?.teams.length || 19) + 1 - (currentLeague?.teams.length % 2);
  const isSeasonOver = currentMatchday > totalMatchdays;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <FootballHeader />
      <main className="flex-grow p-4 md:p-6 space-y-6">
        <h1 className="text-3xl font-bold">Modo Carrera - Temporada {currentSeason}</h1>

        <MatchdayView 
            gameState={gameState}
            onSimulate={handleSimulateDay}
            onNextSeason={handleNextSeason}
            isSeasonOver={isSeasonOver}
        />

        <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>{currentLeague?.name || 'Tabla de Posiciones'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <LeagueTable table={table} playerId={player.teamName} />
                </CardContent>
            </Card>
            <div className="space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Mi Club</CardTitle>
                        <CardDescription>{player.teamName}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Fuerza Actual:</strong> {player.strength.toFixed(0)}</p>
                        <p><strong>Liga:</strong> {currentLeague?.name}</p>
                         <p><strong>Próxima Fecha:</strong> {isSeasonOver ? "Finalizada" : currentMatchday}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleResetGame} variant="destructive" className="w-full">
                    Reiniciar Carrera
                </Button>
            </div>
        </div>
      </main>
    </div>
  );
}
