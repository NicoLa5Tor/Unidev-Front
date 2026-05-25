import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { AnnouncementService } from '../../../features/admin/services/announcement.service';
import { UserSessionService } from '../../../core/services/user-session.service';
import { Announcement } from '../../models/announcement.model';

@Component({
  selector: 'app-announcements-inbox-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './announcements-inbox-dialog.component.html'
})
export class AnnouncementsInboxDialogComponent implements OnInit {
  announcements: Announcement[] = [];
  loading = false;
  expanded: number | null = null;
  lastSeenId = 0;

  constructor(
    private readonly dialogRef: MatDialogRef<AnnouncementsInboxDialogComponent>,
    private readonly announcementService: AnnouncementService,
    private readonly userSessionService: UserSessionService
  ) {}

  ngOnInit(): void {
    const userId = this.userSessionService.snapshot?.id ?? 'anon';
    const key = `lastSeenAnnouncement_${userId}`;
    this.lastSeenId = Number(localStorage.getItem(key) ?? 0);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.announcementService.inbox().subscribe({
      next: items => {
        this.announcements = items;
        this.loading = false;
        this.markRead(items);
      },
      error: () => { this.loading = false; }
    });
  }

  toggle(id: number): void {
    this.expanded = this.expanded === id ? null : id;
  }

  isNew(a: Announcement): boolean {
    return a.id > this.lastSeenId;
  }

  close(): void {
    this.dialogRef.close();
  }

  private markRead(items: Announcement[]): void {
    if (!items.length) return;
    const maxId = Math.max(...items.map(a => a.id));
    const userId = this.userSessionService.snapshot?.id ?? 'anon';
    const key = `lastSeenAnnouncement_${userId}`;
    localStorage.setItem(key, String(maxId));
  }
}
