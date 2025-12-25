// src/lib/signalr.ts
import * as signalR from '@microsoft/signalr';

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api-alap.fptzone.site'
    : 'https://localhost:7248';

export function createChatConnection(accessToken?: string) {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/chat`, {
      accessTokenFactory: () => accessToken || ''
    })
    .withAutomaticReconnect()
    .build();

  return connection;
}
