import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateRatingRequest, RankingEntry, RatingResponse } from '../../../shared/models/rating.model';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly base = `${environment.apiUrl}/ratings`;

  constructor(private readonly http: HttpClient) {}

  createRating(projectId: number, req: CreateRatingRequest): Observable<RatingResponse> {
    return this.http.post<RatingResponse>(`${this.base}/projects/${projectId}`, req);
  }

  getRatingForProject(projectId: number): Observable<RatingResponse | null> {
    return this.http.get<RatingResponse>(`${this.base}/projects/${projectId}`);
  }

  getUserRanking(): Observable<RankingEntry[]> {
    return this.http.get<RankingEntry[]>(`${this.base}/ranking/users`);
  }

  getTeamRanking(): Observable<RankingEntry[]> {
    return this.http.get<RankingEntry[]>(`${this.base}/ranking/teams`);
  }
}
