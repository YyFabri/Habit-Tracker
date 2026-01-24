'use client';

import { useState, useEffect } from 'react';
import type { GameState } from '@/lib/football-types';
import { generateInitialGameState, simulateMatchday, startNewSeason } from '@/lib/football-logic';
import { FootballHeader } from '@/components/football/FootballHeader';
import { LeagueTable } from '@/components/football/LeagueTable';
import { MatchdayView } from '@/components/football/MatchdayView';
import { MatchHistory } from '@/components/football/MatchHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [newCareerName, setNewCareerName] = useState('');

  useEffect(() => {
    setIsClient(true);
    try {
      const savedState = localStorage.getItem('footballGameState');
      if (savedState) {
        setGameState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error("Failed to load football game state:", error);
      localStorage.removeItem('footballGameState');
      setGameState(null);
    }
  }, []);

  useEffect(() => {
    if (isClient && gameState) {
      localStorage.setItem('footballGameState', JSON.stringify(gameState));
    }
  }, [gameState, isClient]);
  
  const handleStartCareer = () => {
    if (newCareerName.trim()) {
        setGameState(generateInitialGameState(newCareerName.trim()));
        setNewCareerName('');
    }
  }

  const handleSimulateDay = () => {
    if (!gameState) return;
    
    // TODO: In a real scenario, you'd fetch this from the habits page.
    // For now, it's a random value to simulate completing or skipping habits.
    const didTrain = Math.random() > 0.3; // 70% chance of training
    const dailyTrainingPoints = didTrain ? Math.floor(Math.random() * 8) + 2 : 0; // 2-10 points if trained
    const isHomeBonus = Math.random() < 0.2; // Placeholder for perfect week bonus

    setGameState(simulateMatchday(gameState, dailyTrainingPoints, isHomeBonus));
  };
  
  const handleResetGame = () => {
     if (window.confirm("¿Estás seguro de que quieres reiniciar tu carrera? Perderás todo tu progreso.")) {
        localStorage.removeItem('footballGameState');
        setGameState(null);
     }
  }

  const handleWinScreenReset = () => {
    localStorage.removeItem('footballGameState');
    setGameState(null);
  }

  const handleNextSeason = () => {
    if (!gameState) return;
    setGameState(startNewSeason(gameState));
  }

  if (!isClient) {
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

  if (!gameState) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <FootballHeader />
            <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Comienza tu Carrera de DT</CardTitle>
                        <CardDescription>Elige un nombre para tu club y llévalo a la gloria.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input 
                            placeholder="Ej: Los Invencibles FC" 
                            value={newCareerName}
                            onChange={(e) => setNewCareerName(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && handleStartCareer()}
                        />
                        <Button onClick={handleStartCareer} disabled={!newCareerName.trim()} className="w-full">
                            Empezar Carrera
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
  }

  if (gameState.gameWon) {
      return <WinScreen gameState={gameState} onReset={handleWinScreenReset} />;
  }
  
  const { table, currentMatchday, fixtures, player, leagues, currentSeason } = gameState;
  const currentLeague = leagues.find(l => l.id === player.currentLeagueId);
  const numTeams = (currentLeague?.teams.length || 0) + 1;
  const totalMatchdays = numTeams % 2 === 0 ? numTeams - 1 : numTeams;
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
                        <p><strong>Moral:</strong> 🔥 {player.morale.toFixed(0)}</p>
                        <p><strong>Liga:</strong> {currentLeague?.name}</p>
                         <p><strong>Próxima Fecha:</strong> {isSeasonOver ? "Finalizada" : currentMatchday}</p>
                    </CardContent>
                </Card>
                <Button onClick={handleResetGame} variant="destructive" className="w-full">
                    Reiniciar Carrera
                </Button>
            </div>
             <div className="md:col-span-3">
                <MatchHistory gameState={gameState} />
            </div>
        </div>
      </main>
    </div>
  );
}
