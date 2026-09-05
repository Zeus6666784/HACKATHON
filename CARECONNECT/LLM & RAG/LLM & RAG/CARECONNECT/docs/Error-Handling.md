# Error Handling - CareConnect Maharashtra

This document defines how the system handles failures to ensure a safe and reliable user experience.

## 1. Error Categories and Responses

| Error Type | HTTP Code | User Response | Technical Action |
|---|---|---|---|
| **Validation Error** | `400` | "Please check the highlighted fields." | Return Zod validation errors. |
| **Authentication Failure** | `401` | "Session expired. Please login again." | Redirect to login page. |
| **Authorization Failure** | `403` | "You do not have permission to do this." | Log unauthorized access attempt. |
| **Resource Not Found** | `404` | "The requested record was not found." | Return standard 404 page. |
| **Server Error** | `500` | "A system error occurred. Please try again." | Log stack trace; hide details from user. |
| **AI Failure** | `502` | "AI triage unavailable. Using standard rules." | Trigger Rule-based Fallback. |
| **Map API Failure** | `503` | "Map loading failed. Showing list view." | Fallback to simple table of facilities. |

## 2. Critical Failure Fallbacks

### 2.1 AI Triage Fallback
If the LLM API fails or returns an invalid response:
1. Log the AI error.
2. Switch to the **Danger-Sign Matrix**.
3. Tag the result as `FALLBACK_USED`.
4. Prompt the doctor to double-check the result.

### 2.2 Referral State Failures
If an invalid state transition is attempted (e.g., `CREATED` $\rightarrow$ `CLOSED`):
1. Reject the request with a `400 Bad Request`.
2. Provide a clear error: "Referral must be Accepted and Arrived before it can be Closed."

### 2.3 Network Failures
For rural health workers with poor connectivity:
1. **Optimistic UI**: Update the UI immediately.
2. **Sync Queue**: Queue the request in `localStorage`.
3. **Retry Logic**: Attempt to sync when connection is restored.

## 3. User-Safe Error Messaging
- **No Technical Jargon**: Avoid "NullPointerException" or "MongooseValidationError".
- **Actionable Guidance**: Instead of "Error 403", use "You need Doctor permissions to close this referral. Please contact your administrator."
- **Safe Defaults**: In case of uncertainty in a critical field, default to the safest option (e.g., Priority = HIGH).
