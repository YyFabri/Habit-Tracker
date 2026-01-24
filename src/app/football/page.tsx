'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GameState } from '@/lib/football-types';
import { generateInitialGameState, simulateMatchday } from '@/lib/football-logic';
import { FootballHeader } from '@/components/football/FootballHeader';
import { LeagueTable } from '@/components/football/LeagueTable';
import { MatchdayView } from '@/components/football/MatchdayView';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


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

    const updatedGameState = simulateMatchday(gameState, dailyTrainingPoints, isHomeBonus);

    setGameState(updatedGameState);
  };
  
  const handleResetGame = () => {
     if (window.confirm("¿Estás seguro de que quieres reiniciar tu carrera? Perderás todo tu progreso.")) {
        localStorage.removeItem('footballGameState');
        setGameState(generateInitialGameState());
     }
  }


  if (!isClient || !gameState) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <FootballHeader />
            <main className="flex-grow p-4 md:p-6 space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-12 w-full" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </main>
        </div>
    );
  }
  
  const { table, currentMatchday, fixtures, player } = gameState;
  const currentLeague = gameState.leagues.find(l => l.id === player.currentLeagueId);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <FootballHeader />
      <main className="flex-grow p-4 md:p-6 space-y-6">
        <h1 className="text-3xl font-bold">Modo Carrera</h1>

        <MatchdayView 
            gameState={gameState}
            onSimulate={handleSimulateDay}
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
                         <p><strong>Próxima Fecha:</strong> {currentMatchday}</p>
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
