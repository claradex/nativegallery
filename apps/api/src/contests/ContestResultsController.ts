import { Controller, Get, Header } from '@nestjs/common';
import { database, Prisma } from '@nativegallery/database';
import type { ContestWinnerData } from '@nativegallery/contracts';

@Controller('api/contests')
export class ContestResultsController {
  @Get('results')
  @Header('Cache-Control', 'public, max-age=60')
  results() {
    return database.$queryRaw<ContestWinnerData[]>(Prisma.sql`
      SELECT w.id, w.contest_id AS contestId, w.date, w.place, p.id AS photoId,
             p.photourl AS photoUrl, COALESCE(t.title, '') AS theme
      FROM contests_winners w
      JOIN photos p ON p.id = w.photo_id AND p.moderated = 1
      LEFT JOIN contests c ON c.id = w.contest_id
      LEFT JOIN contests_themes t ON t.id = c.themeid
      WHERE w.place BETWEEN 1 AND 3
      ORDER BY w.contest_id, w.place, w.id
    `);
  }
}
