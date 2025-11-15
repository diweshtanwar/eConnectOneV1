import { messagesApi } from '../api/api';

interface TicketStatusNotification {
  ticketId: string;
  userId: number;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
}

export class TicketNotificationService {
  static async sendStatusUpdateNotification(notification: TicketStatusNotification) {
    try {
      const message = {
        toUserId: notification.userId,
        subject: `Ticket Status Update - ${notification.ticketId}`,
        body: `Your ticket ${notification.ticketId} status has been updated from "${notification.oldStatus}" to "${notification.newStatus}" by ${notification.updatedBy}.`,
        priority: 'Normal'
      };

      await messagesApi.sendMessage(message);
      console.log(`Status notification sent for ticket ${notification.ticketId}`);
    } catch (error) {
      console.error('Failed to send ticket status notification:', error);
    }
  }

  static async sendTicketAssignmentNotification(ticketId: string, assignedToUserId: number, assignedBy: string) {
    try {
      const message = {
        toUserId: assignedToUserId,
        subject: `Ticket Assignment - ${ticketId}`,
        body: `You have been assigned to ticket ${ticketId} by ${assignedBy}. Please review and take appropriate action.`,
        priority: 'High'
      };

      await messagesApi.sendMessage(message);
      console.log(`Assignment notification sent for ticket ${ticketId}`);
    } catch (error) {
      console.error('Failed to send ticket assignment notification:', error);
    }
  }

  static async sendTicketCommentNotification(ticketId: string, userId: number, commenterName: string) {
    try {
      const message = {
        toUserId: userId,
        subject: `New Comment on Ticket - ${ticketId}`,
        body: `${commenterName} has added a new comment to your ticket ${ticketId}. Please check the ticket for details.`,
        priority: 'Normal'
      };

      await messagesApi.sendMessage(message);
      console.log(`Comment notification sent for ticket ${ticketId}`);
    } catch (error) {
      console.error('Failed to send ticket comment notification:', error);
    }
  }
}