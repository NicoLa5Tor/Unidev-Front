export interface Announcement {
  id: number;
  title: string;
  body: string;
  targetRole: string | null;
  sentBy: string | null;
  recipientCount: number;
  sentAt: string;
}

export interface AnnouncementRequest {
  title: string;
  body: string;
  targetRole: string | null;
}
