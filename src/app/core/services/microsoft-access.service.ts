import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MicrosoftAccessRequestDto, MicrosoftAccessResponseDto } from '../models/microsoft-access.dto';

@Injectable({ providedIn: 'root' })
export class MicrosoftAccessService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tenant/microsoft-access`;

  requestAccess(email: string): Observable<MicrosoftAccessResponseDto> {
    const payload: MicrosoftAccessRequestDto = { email };
    return this.http.post<MicrosoftAccessResponseDto>(this.baseUrl, payload);
  }
}
