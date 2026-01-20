'use client';

import { useMemo } from 'react';
import { motivationalQuotes } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { getDayOfYear } from 'date-fns';

interface MotivationalQuoteProps {
  functionalDate: Date;
}

export function MotivationalQuote({ functionalDate }: MotivationalQuoteProps) {
  const quote = useMemo(() => {
    // This creates a deterministic index based on the day of the year.
    const dayOfYear = getDayOfYear(functionalDate);
    const quoteIndex = (dayOfYear - 1) % motivationalQuotes.length;
    return motivationalQuotes[quoteIndex];
  }, [functionalDate]);

  return (
    <Card className="rounded-3xl bg-accent/20 border-accent/30">
      <CardContent className="p-6 text-center">
        <p className="text-lg font-medium text-accent-foreground/80 italic">
          "{quote}"
        </p>
      </CardContent>
    </Card>
  );
}
