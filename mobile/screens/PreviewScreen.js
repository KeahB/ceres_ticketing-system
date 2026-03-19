import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Share } from 'react-native';
import { Printer, Save, ArrowLeft } from 'lucide-react-native';
import { generateTicketId } from '../utils/idGenerator';
import { formatDateTime } from '../utils/dateFormatter';
import { saveTicket } from '../services/sqliteService';
import { getConductorSession } from '../services/authService';

const PreviewScreen = ({ route, navigation }) => {
  const { origin, destination, distance, passengerType, passengerName, fareData } = route.params;
  const [conductorName, setConductorName] = useState('UNSPECIFIED');
  const ticketId = generateTicketId();
  const dateTime = formatDateTime();

  useEffect(() => {
    loadConductor();
  }, []);

  const loadConductor = async () => {
    const session = await getConductorSession();
    if (session) {
      const fullName = `${session.firstName} ${session.lastName}`.trim();
      setConductorName(fullName.toUpperCase());
    }
  };

  const handleSave = async () => {
    try {
      const session = await getConductorSession();
      const routeName = `${origin} to ${destination}`;
      await saveTicket({
        ticket_id: ticketId,
        conductor_id: session?.id || null,
        conductor_name: session ? `${session.firstName} ${session.lastName}`.trim() : 'Unknown',
        passenger_name: passengerName,
        payment_status: 'unpaid',
        origin,
        destination,
        route_name: routeName,
        distance,
        passenger_type: passengerType,
        fare: fareData.roundedFare
      });
      alert('Ticket Saved Successfully!');
      navigation.popToTop();
    } catch (err) {
      alert('Failed to save ticket: ' + err.message);
    }
  };

  const simulatePrint = () => {
    const text = `
CERES LINER - DUMAGUETE
-----------------------
ID: ${ticketId}
DATE: ${dateTime}
CONDUCTOR: ${conductorName}
PASSENGER: ${passengerName}
STATUS: UNPAID
ROUTE: ${origin} to ${destination}
DIST: ${distance.toFixed(2)} KM
TYPE: ${passengerType.toUpperCase()}
-----------------------
RATE: ₱${fareData.ratePerKm.toFixed(2)}/KM
RAW: ₱${fareData.rawFare.toFixed(2)}
FINAL: ₱${fareData.roundedFare.toFixed(2)}
-----------------------
THANK YOU!
    `;
    Share.share({ message: text });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.receiptContainer}>
        <View style={styles.receipt}>
          <Text style={styles.brand}>CERES LINER</Text>
          <Text style={styles.subBrand}>DUMAGUETE CITY</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>TICKET ID</Text>
            <Text style={styles.value}>{ticketId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CONDUCTOR</Text>
            <Text style={styles.value}>{conductorName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PASSENGER</Text>
            <Text style={styles.value}>{passengerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DATE & TIME</Text>
            <Text style={styles.value}>{dateTime}</Text>
          </View>

          <View style={styles.routeHeader}>
            <Text style={styles.routeTitle}>ROUTE</Text>
            <Text style={styles.routeText}>{origin} → {destination}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>DISTANCE</Text>
            <Text style={styles.value}>{distance.toFixed(2)} KM</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PASSENGER</Text>
            <Text style={styles.value}>{passengerType.toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PAYMENT STATUS</Text>
            <Text style={[styles.value, styles.unpaidValue]}>UNPAID</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>RATE PER KM</Text>
            <Text style={styles.value}>₱{fareData.ratePerKm.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>FINAL FARE</Text>
            <Text style={styles.totalValue}>₱{fareData.roundedFare.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.footer}>OFFICIAL RECEIPT</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save color="#FFF" />
          <Text style={styles.saveText}>SAVE TICKET</Text>
        </TouchableOpacity>
        
        <View style={styles.secondaryButtons}>
          <TouchableOpacity style={styles.printButton} onPress={simulatePrint}>
            <Printer color="#FFF" />
            <Text style={styles.printText}>PRINT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#AAA" />
            <Text style={styles.backText}>BACK</Text>
          </TouchableOpacity>
        </View>
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
  receiptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receipt: {
    backgroundColor: '#FFF',
    width: '100%',
    padding: 30,
    borderRadius: 5,
    elevation: 10,
  },
  brand: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    color: '#000',
  },
  subBrand: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CCC',
    marginVertical: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    color: '#666',
    fontSize: 14,
  },
  value: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  unpaidValue: {
    color: '#D97706',
  },
  routeHeader: {
    marginVertical: 10,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 5,
  },
  routeTitle: {
    fontSize: 10,
    color: '#AAA',
    fontWeight: 'bold',
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
  },
  footer: {
    textAlign: 'center',
    color: '#AAA',
    fontSize: 12,
    marginTop: 20,
  },
  buttonContainer: {
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 25,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  saveText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  printButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  printText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  backText: {
    color: '#AAA',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PreviewScreen;
