import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ticket, History, RefreshCcw, LogOut, Archive } from 'lucide-react-native';
import { formatDateTime } from '../utils/dateFormatter';
import { syncTickets } from '../services/syncService';
import { getConductorSession, logoutConductor } from '../services/authService';
import {
  archiveLocalShiftTickets,
  getActiveShiftSummary,
  getSyncedActiveTicketIds,
  getUnsyncedTicketSummary,
} from '../services/sqliteService';
import { conductorApi } from '../services/apiClient';

const HomeScreen = ({ navigation }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [syncing, setSyncing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [conductorName, setConductorName] = useState('CONDUCTOR');

  useEffect(() => {
    loadSession();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadSession = async () => {
    const session = await getConductorSession();
    if (session) {
      const fullName = `${session.firstName} ${session.lastName}`.trim();
      setConductorName(fullName.toUpperCase());
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        onPress: async () => {
          await logoutConductor();
          navigation.replace('Login');
        } 
      }
    ]);
  };

  const handleSync = async () => {
    const summary = await getUnsyncedTicketSummary();

    if (summary.total === 0) {
      Alert.alert('No Tickets To Sync', 'All local tickets are already synced.');
      return;
    }

    Alert.alert(
      'Confirm Final Sync',
      `You are about to sync today's unsynced tickets.\n\nTotal: ${summary.total}\nPaid: ${summary.paid}\nUnpaid: ${summary.unpaid}\nVoid: ${summary.void}\n\nPlease confirm you are done working and each ticket is marked correctly before sending to the backend.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Sync',
          onPress: async () => {
            setSyncing(true);
            setSyncMessage('Syncing...');
            const result = await syncTickets();
            if (result.success) {
              setSyncMessage(`Synced ${result.count} tickets!`);
            } else {
              setSyncMessage(result.message || 'Sync failed. Check connection.');
            }
            setTimeout(() => {
              setSyncing(false);
              setSyncMessage('');
            }, 3000);
          },
        },
      ]
    );
  };

  const handleArchiveShift = async () => {
    const unsyncedSummary = await getUnsyncedTicketSummary();
    if (unsyncedSummary.total > 0) {
      Alert.alert(
        'Sync Required First',
        'Please sync all active tickets before archiving this shift so the admin can see and manage them.'
      );
      return;
    }

    const shiftSummary = await getActiveShiftSummary();
    if (shiftSummary.total === 0) {
      Alert.alert('Nothing To Archive', 'There are no active shift tickets to move into archive.');
      return;
    }

    Alert.alert(
      'Archive Current Shift',
      `This will refresh the conductor history for a fresh start.\n\nTickets: ${shiftSummary.total}\nPaid: ${shiftSummary.paid}\nUnpaid: ${shiftSummary.unpaid}\nVoid: ${shiftSummary.void}\nPaid Earnings: PHP ${Number(shiftSummary.paidEarnings).toFixed(2)}\nUnpaid Total: PHP ${Number(shiftSummary.unpaidEarnings).toFixed(2)}\n\nAll active synced tickets will be moved to archive and will still be visible to the admin for management.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive Shift',
          style: 'destructive',
          onPress: async () => {
            try {
              setArchiving(true);
              setSyncMessage('Archiving shift...');
              const ticketIds = await getSyncedActiveTicketIds();
              if (ticketIds.length === 0) {
                setSyncMessage('No synced active tickets were found to archive.');
                setTimeout(() => {
                  setArchiving(false);
                  setSyncMessage('');
                }, 3000);
                return;
              }
              await conductorApi.post('/tickets/archive', { ticketIds });
              await archiveLocalShiftTickets();
              setSyncMessage('Shift archived. History and earnings are now reset for a fresh start.');
            } catch (error) {
              setSyncMessage(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to archive shift.'
              );
            } finally {
              setTimeout(() => {
                setArchiving(false);
                setSyncMessage('');
              }, 3500);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} color="#FF4444" />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.dateText}>{formatDateTime(currentTime)}</Text>
        <Text style={styles.conductorLabel}>CONDUCTOR ON DUTY</Text>
        <Text style={styles.conductorName}>{conductorName}</Text>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.navigate('Generator')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FFD700' }]}>
            <Ticket size={40} color="#000" />
          </View>
          <View>
            <Text style={styles.buttonSubText}>NEW TICKET</Text>
            <Text style={styles.buttonText}>GENERATE</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.navigate('History')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' }]}>
            <History size={40} color="#FFF" />
          </View>
          <View>
            <Text style={styles.buttonSubText}>RECORDS</Text>
            <Text style={styles.buttonText}>HISTORY</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.syncButton, syncing && styles.disabledButton]} 
          onPress={handleSync}
          disabled={syncing || archiving}
        >
          <RefreshCcw size={24} color="#FFF" />
          <Text style={styles.syncButtonText}>
            {syncing ? 'SYNCING...' : 'SYNC WITH BACKEND'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.archiveButton, archiving && styles.disabledButton]}
          onPress={handleArchiveShift}
          disabled={syncing || archiving}
        >
          <Archive size={22} color="#121212" />
          <Text style={styles.archiveButtonText}>
            {archiving ? 'ARCHIVING...' : 'ARCHIVE SHIFT'}
          </Text>
        </TouchableOpacity>
        {syncMessage !== '' && <Text style={styles.syncStatus}>{syncMessage}</Text>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 10,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  dateText: {
    color: '#AAA',
    fontSize: 18,
    fontFamily: 'System',
  },
  conductorLabel: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 30,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  conductorName: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 5,
  },
  menuGrid: {
    flex: 1,
    gap: 20,
  },
  menuButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 25,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    height: 140,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 25,
  },
  buttonSubText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  footer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  syncButton: {
    backgroundColor: '#333',
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  archiveButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  syncButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  syncStatus: {
    color: '#FFD700',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  archiveButtonText: {
    color: '#121212',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default HomeScreen;
