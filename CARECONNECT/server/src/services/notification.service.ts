export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Notification {
  userId: string;
  message: string;
  priority: NotificationPriority;
  type: "REFERRAL_UPDATE" | "TRIAGE_ALERT" | "SYSTEM";
  timestamp: Date;
}

class NotificationService {
  // ponytail: console logging for now. replace with SNS/Twilio/Firebase later.
  async send(notification: Notification) {
    console.log(`[NOTIFICATION][${notification.priority}] to User ${notification.userId}: ${notification.message}`);
    return { success: true };
  }

  async notifyReferralStatus(referralId: string, status: string, facilityId: string) {
    // In a real app, fetch users of that facility and notify them
    return this.send({
      userId: "system",
      message: `Referral ${referralId} status changed to ${status} at facility ${facilityId}`,
      priority: "MEDIUM",
      type: "REFERRAL_UPDATE",
      timestamp: new Date()
    });
  }
}

export const notificationService = new NotificationService();
