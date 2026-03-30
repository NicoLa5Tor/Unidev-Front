import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { EmailTemplate, EmailTemplatePayload } from '../../../shared/models/email-template.model';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {
  private readonly emailTemplatesUrl = `${environment.apiUrl}/email-templates`;

  constructor(private readonly http: HttpClient) {}

  getEmailTemplates() {
    return this.http.get<EmailTemplate[]>(this.emailTemplatesUrl);
  }

  getEmailTemplate(templateId: number) {
    return this.http.get<EmailTemplate>(`${this.emailTemplatesUrl}/${templateId}`);
  }

  createEmailTemplate(payload: EmailTemplatePayload) {
    return this.http.post<EmailTemplate>(this.emailTemplatesUrl, payload);
  }

  updateEmailTemplate(templateId: number, payload: EmailTemplatePayload) {
    return this.http.put<EmailTemplate>(`${this.emailTemplatesUrl}/${templateId}`, payload);
  }

  deleteEmailTemplate(templateId: number) {
    return this.http.delete<void>(`${this.emailTemplatesUrl}/${templateId}`);
  }
}
