'use client';

import type { TableEntry } from '@/lib/football-types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface LeagueTableProps {
  table: TableEntry[];
  playerId: string;
}

export function LeagueTable({ table, playerId }: LeagueTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-center">#</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead className="text-center">PJ</TableHead>
            <TableHead className="text-center">G</TableHead>
            <TableHead className="text-center">E</TableHead>
            <TableHead className="text-center">P</TableHead>
            <TableHead className="text-center">DG</TableHead>
            <TableHead className="text-center">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.map((entry, index) => (
            <TableRow key={entry.teamId} className={cn(entry.teamId === playerId && 'bg-primary/10 font-bold')}>
              <TableCell className="text-center font-medium">{index + 1}</TableCell>
              <TableCell>{entry.teamName}</TableCell>
              <TableCell className="text-center">{entry.played}</TableCell>
              <TableCell className="text-center">{entry.wins}</TableCell>
              <TableCell className="text-center">{entry.draws}</TableCell>
              <TableCell className="text-center">{entry.losses}</TableCell>
              <TableCell className="text-center">{entry.goalDifference}</TableCell>
              <TableCell className="text-center font-bold">{entry.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
