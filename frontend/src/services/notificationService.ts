class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    this.requestPermission();
  }

  async requestPermission(): Promise<void> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
  }

  showTicketNotification(ticket: {
    ticketId: string;
    summary: string;
    amount: number;
    ticketType: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }): void {
    if (this.permission !== 'granted') return;

    const title = `${ticket.priority} ${ticket.ticketType.toUpperCase()} Request`;
    const body = `₹${ticket.amount.toLocaleString()} - ${ticket.summary}`;
    
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: ticket.ticketId,
      requireInteraction: ticket.priority === 'URGENT',
      data: { ticketId: ticket.ticketId }
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = `/tickets/${ticket.ticketId}`;
      notification.close();
    };

    // Auto-close after 10 seconds for non-urgent
    if (ticket.priority !== 'URGENT') {
      setTimeout(() => notification.close(), 10000);
    }
  }

  showBulkNotification(count: number): void {
    if (this.permission !== 'granted') return;

    const notification = new Notification(`${count} New Tickets`, {
      body: 'Multiple tickets require your attention',
      icon: '/favicon.ico',
      tag: 'bulk-tickets'
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = '/tickets';
      notification.close();
    };

    setTimeout(() => notification.close(), 5000);
  }
}

export const notificationService = new NotificationService();