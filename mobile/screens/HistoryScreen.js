import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Filter, TrendingUp } from 'lucide-react-native';
import {
  getAllTickets,
  getEarningsReport,
  updateTicketDetails,
} from '../services/sqliteService';
import { formatDateTime } from '../utils/dateFormatter';

const PAYMENT_STATUSES = [
  { value: 'paid', label: 'PAID', color: '#22C55E' },
  { value: 'unpaid', label: 'UNPAID', color: '#F59E0B' },
  { value: 'void', label: 'VOID', color: '#EF4444' },
];

const HistoryScreen = () => {
  const [tickets, setTickets] = useState([]);
  const [totalToday, setTotalToday] = useState(0);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editPassengerName, setEditPassengerName] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('unpaid');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const ticketList = await getAllTickets();
    setTickets(ticketList);

    const earningList = await getEarningsReport();
    const today = new Date().toISOString().split('T')[0];
    const todayEarn = earningList.find((item) => item.date === today)?.total_earnings || 0;
    setTotalToday(todayEarn);
  };

  const openEditor = (ticket) => {
    if (ticket.synced) {
      Alert.alert('Already Synced', 'This ticket has already been synced and can no longer be edited here.');
      return;
    }

    setEditingTicket(ticket);
    setEditPassengerName(ticket.passenger_name || '');
    setEditPaymentStatus(ticket.payment_status || 'unpaid');
  };

  const closeEditor = () => {
    setEditingTicket(null);
    setEditPassengerName('');
    setEditPaymentStatus('unpaid');
    setSaving(false);
  };

  const saveChanges = async () => {
    if (!editPassengerName.trim()) {
      alert('Passenger name is required.');
      return;
    }

    if (!editingTicket) {
      return;
    }

    setSaving(true);
    try {
      await updateTicketDetails(editingTicket.id, {
        passenger_name: editPassengerName.trim(),
        payment_status: editPaymentStatus,
      });
      await loadData();
      closeEditor();
    } catch (error) {
      setSaving(false);
      alert('Failed to update ticket: ' + error.message);
    }
  };

  const renderItem = ({ item }) => {
    const statusMeta = PAYMENT_STATUSES.find((status) => status.value === item.payment_status) || PAYMENT_STATUSES[1];

    return (
      <TouchableOpacity style={styles.ticketCard} onPress={() => openEditor(item)}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.ticketId}>{item.ticket_id}</Text>
            <Text style={styles.passengerName}>{item.passenger_name || 'NO PASSENGER NAME'}</Text>
          </View>
          <Text style={styles.ticketFare}>PHP {item.fare.toFixed(2)}</Text>
        </View>

        <View style={styles.routeRow}>
          <Text style={styles.routeText}>
            {item.origin || '-'} -> {item.destination || '-'}
          </Text>
          <Text style={styles.passengerType}>{String(item.passenger_type || '').toUpperCase()}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.ticketDate}>{formatDateTime(item.created_at)}</Text>
          <View style={styles.badgeRow}>
            <Text style={[styles.paymentBadge, { color: statusMeta.color, borderColor: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
            <Text style={[styles.syncStatus, { color: item.synced ? '#4CAF50' : '#FF9800' }]}>
              {item.synced ? 'SYNCED' : 'LOCAL'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <TrendingUp color="#FFD700" size={24} />
          <View>
            <Text style={styles.statLabel}>TOTAL EARNINGS (TODAY)</Text>
            <Text style={styles.statValue}>PHP {totalToday.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>RECENT TICKETS</Text>
        <View style={styles.filterButton}>
          <Filter color="#AAA" size={20} />
          <Text style={styles.filterText}>Tap a ticket to edit</Text>
        </View>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No tickets found.</Text>}
      />

      <Modal visible={!!editingTicket} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Ticket</Text>
            <Text style={styles.modalSubtitle}>{editingTicket?.ticket_id}</Text>

            <Text style={styles.inputLabel}>Passenger Name</Text>
            <TextInput
              style={styles.textInput}
              value={editPassengerName}
              onChangeText={setEditPassengerName}
              placeholder="Enter passenger name"
              placeholderTextColor="#666"
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Payment Status</Text>
            <View style={styles.statusGrid}>
              {PAYMENT_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusOption,
                    editPaymentStatus === status.value && {
                      borderColor: status.color,
                      backgroundColor: `${status.color}22`,
                    },
                  ]}
                  onPress={() => setEditPaymentStatus(status.value)}
                >
                  <Text style={[styles.statusOptionText, editPaymentStatus === status.value && { color: status.color }]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeEditor}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveChanges} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'SAVING...' : 'SAVE'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
  },
  statLabel: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  sectionTitle: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterText: {
    color: '#AAA',
    fontSize: 12,
  },
  listContent: {
    padding: 20,
  },
  ticketCard: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  ticketId: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  passengerName: {
    color: '#DDD',
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  ticketFare: {
    color: '#FFD700',
    fontWeight: '900',
    fontSize: 18,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  routeText: {
    color: '#AAA',
    fontSize: 13,
    flex: 1,
  },
  passengerType: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  ticketDate: {
    color: '#666',
    fontSize: 12,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  syncStatus: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#AAA',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
  },
  inputLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#121212',
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statusOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  statusOptionText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2B2B2B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#AAA',
    fontWeight: '800',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: '900',
  },
});

export default HistoryScreen;
