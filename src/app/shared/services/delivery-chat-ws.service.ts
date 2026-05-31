import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Client, IMessage, IStompSocket, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDeliveryChatMessage } from '../models/deployment.model';

interface TopicEntry {
  subject: Subject<ApplicationDeliveryChatMessage>;
  stompSub: StompSubscription | null;
}

@Injectable({ providedIn: 'root' })
export class DeliveryChatWsService implements OnDestroy {
  private client: Client | null = null;
  private topics = new Map<number, TopicEntry>();

  constructor(private readonly zone: NgZone) {}

  private get wsUrl(): string {
    return environment.apiUrl.replace('/api', '') + '/ws';
  }

  connect(): void {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl, null, {
        transports: ['xhr-streaming', 'xhr-polling']
      }) as IStompSocket,
      reconnectDelay: 5000,
      onStompError: frame => console.error('[DeliveryChatWS] STOMP error', frame),
      onConnect: () => {
        // Re-subscribe all pending topics after connect / reconnect
        this.topics.forEach((entry, appId) => {
          if (!entry.stompSub) {
            entry.stompSub = this.doSubscribe(appId, entry.subject);
          }
        });
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.topics.forEach(entry => {
      entry.stompSub?.unsubscribe();
      entry.subject.complete();
    });
    this.topics.clear();
    this.client?.deactivate();
    this.client = null;
  }

  messages$(applicationId: number): Observable<ApplicationDeliveryChatMessage> {
    let entry = this.topics.get(applicationId);
    if (!entry) {
      const subject = new Subject<ApplicationDeliveryChatMessage>();
      const stompSub = this.client?.connected
        ? this.doSubscribe(applicationId, subject)
        : null;
      entry = { subject, stompSub };
      this.topics.set(applicationId, entry);
    }
    return entry.subject.asObservable();
  }

  unsubscribe(applicationId: number): void {
    const entry = this.topics.get(applicationId);
    if (!entry) return;
    entry.stompSub?.unsubscribe();
    entry.subject.complete();
    this.topics.delete(applicationId);
  }

  private doSubscribe(
    applicationId: number,
    subject: Subject<ApplicationDeliveryChatMessage>
  ): StompSubscription {
    return this.client!.subscribe(
      `/topic/delivery-chat/${applicationId}`,
      (msg: IMessage) => {
        try {
          const parsed = JSON.parse(msg.body) as ApplicationDeliveryChatMessage;
          this.zone.run(() => subject.next(parsed));
        } catch (e) {
          console.error('[DeliveryChatWS] parse error', e);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
