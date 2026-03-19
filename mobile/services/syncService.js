import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUnsyncedTickets, markAsSynced } from './sqliteService';
import { API_CONFIG } from '../config/apiConfig';
import { getConductorSession } from './authService';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const SYNC_LOG_KEY = '@sync_log';

// Sleep function for retry delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Log sync attempts
const logSyncAttempt = async (ticketId, status, error = null) => {
  try {
    const log = await AsyncStorage.getItem(SYNC_LOG_KEY);
    const syncLog = log ? JSON.parse(log) : [];
    syncLog.push({
      ticketId,
      status,
      error,
      timestamp: new Date().toISOString(),
    });
    // Keep only last 100 entries
    if (syncLog.length > 100) {
      syncLog.shift();
    }
    await AsyncStorage.setItem(SYNC_LOG_KEY, JSON.stringify(syncLog));
  } catch (err) {
    console.error('Failed to log sync attempt:', err);
  }
};

// Sync a single ticket with retry logic
const syncSingleTicket = async (ticket, retryCount = 0) => {
  try {
    const session = await getConductorSession();
    if (!session?.token) {
      throw new Error('Conductor session expired. Please login again before syncing tickets.');
    }

    const response = await axios.post(`${API_CONFIG.BASE_URL}/api/tickets`, {
      ticket_id: ticket.ticket_id,
      passenger_name: ticket.passenger_name,
      payment_status: ticket.payment_status,
      origin: ticket.origin,
      destination: ticket.destination,
      route_name: ticket.route_name,
      distance: ticket.distance,
      passenger_type: ticket.passenger_type,
      fare: ticket.fare,
    }, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.status === 201) {
      await markAsSynced(ticket.id);
      await logSyncAttempt(ticket.ticket_id, 'success');
      return { success: true, ticketId: ticket.ticket_id };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
    console.error(`Failed to sync ticket ${ticket.ticket_id} (attempt ${retryCount + 1}/${MAX_RETRIES}):`, errorMessage);

    if (retryCount < MAX_RETRIES) {
      await logSyncAttempt(ticket.ticket_id, 'retry', errorMessage);
      await sleep(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      return syncSingleTicket(ticket, retryCount + 1);
    } else {
      await logSyncAttempt(ticket.ticket_id, 'failed', errorMessage);
      return { success: false, ticketId: ticket.ticket_id, error: errorMessage };
    }
  }
};

// Main sync function
export const syncTickets = async () => {
  try {
    const unsyncedTickets = await getUnsyncedTickets();

    if (unsyncedTickets.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'No unsynced tickets',
      };
    }

    console.log(`Starting sync of ${unsyncedTickets.length} tickets...`);

    const results = await Promise.all(
      unsyncedTickets.map((ticket) => syncSingleTicket(ticket))
    );

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return {
      success: failedCount === 0,
      count: successCount,
      total: unsyncedTickets.length,
      failed: failedCount,
      message: `Synced ${successCount}/${unsyncedTickets.length} tickets`,
    };
  } catch (error) {
    console.error('Sync operation error:', error.message);
    await logSyncAttempt('batch', 'failed', error.message);
    return {
      success: false,
      count: 0,
      error: error.message,
      message: 'Sync failed: ' + (error.message || 'Unknown error'),
    };
  }
};

// Get sync history
export const getSyncHistory = async () => {
  try {
    const log = await AsyncStorage.getItem(SYNC_LOG_KEY);
    return log ? JSON.parse(log) : [];
  } catch (err) {
    console.error('Failed to retrieve sync history:', err);
    return [];
  }
};

// Clear sync history
export const clearSyncHistory = async () => {
  try {
    await AsyncStorage.removeItem(SYNC_LOG_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear sync history:', err);
    return false;
  }
};
