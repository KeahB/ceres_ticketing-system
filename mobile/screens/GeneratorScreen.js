import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Modal,
  FlatList,
  TextInput
} from 'react-native';
import { MapPin, ChevronDown, User, GraduationCap, Heart, Award } from 'lucide-react-native';
import { MUNICIPALITIES } from '../data/municipalities';
import { calculateFareByRoute } from '../services/fareService';

const PASSENGER_TYPES = [
  { id: 'regular', label: 'REGULAR', icon: User, color: '#2196F3' },
  { id: 'student', label: 'STUDENT', icon: GraduationCap, color: '#E91E63' },
  { id: 'senior', label: 'SENIOR', icon: Heart, color: '#FF9800' },
  { id: 'pwd', label: 'PWD', icon: Award, color: '#9C27B0' },
];

const GeneratorScreen = ({ navigation }) => {
  const [fromMunicipality, setFromMunicipality] = useState("Dumaguete City");
  const [toMunicipality, setToMunicipality] = useState("Sibulan");
  const [passengerType, setPassengerType] = useState('regular');
  const [passengerName, setPassengerName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState('from'); // 'from' or 'to'

  const openPicker = (type) => {
    setSelectingFor(type);
    setModalVisible(true);
  };

  const selectMunicipality = (name) => {
    if (selectingFor === 'from') {
      setFromMunicipality(name);
    } else {
      setToMunicipality(name);
    }
    setModalVisible(false);
  };

  const handleGenerate = () => {
    if (fromMunicipality === toMunicipality) {
      alert('Origin and Destination cannot be the same');
      return;
    }

    if (!passengerName.trim()) {
      alert('Please enter the passenger name');
      return;
    }

    const fareData = calculateFareByRoute(fromMunicipality, toMunicipality, passengerType);
    
    navigation.navigate('Preview', {
      origin: fromMunicipality,
      destination: toMunicipality,
      distance: fareData.distance,
      passengerType,
      passengerName: passengerName.trim(),
      fareData
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>SELECT ROUTE</Text>
        
        <View style={styles.routeBox}>
          <TouchableOpacity style={styles.picker} onPress={() => openPicker('from')}>
            <View style={styles.pickerHeader}>
              <MapPin size={18} color="#FFD700" />
              <Text style={styles.pickerLabel}>FROM (ORIGIN)</Text>
            </View>
            <View style={styles.pickerValue}>
              <Text style={styles.pickerText}>{fromMunicipality}</Text>
              <ChevronDown size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <View style={styles.routeDivider} />

          <TouchableOpacity style={styles.picker} onPress={() => openPicker('to')}>
            <View style={styles.pickerHeader}>
              <MapPin size={18} color="#4CAF50" />
              <Text style={styles.pickerLabel}>TO (DESTINATION)</Text>
            </View>
            <View style={styles.pickerValue}>
              <Text style={styles.pickerText}>{toMunicipality}</Text>
              <ChevronDown size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>PASSENGER TYPE</Text>
        <View style={styles.typeGrid}>
          {PASSENGER_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  passengerType === type.id && { borderColor: type.color, backgroundColor: type.color + '20' }
                ]}
                onPress={() => setPassengerType(type.id)}
              >
                <Icon size={32} color={passengerType === type.id ? type.color : '#FFF'} />
                <Text style={[
                  styles.typeText,
                  passengerType === type.id && { color: type.color, fontWeight: 'bold' }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>PASSENGER NAME</Text>
        <View style={styles.passengerBox}>
          <Text style={styles.inputLabel}>FULL NAME</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter passenger full name"
            placeholderTextColor="#666"
            value={passengerName}
            onChangeText={setPassengerName}
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
          <Text style={styles.generateButtonText}>CALCULATE FARE</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Municipality Picker Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {selectingFor.toUpperCase()}</Text>
            <FlatList
              data={MUNICIPALITIES}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => selectMunicipality(item.name)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <Text style={styles.modalItemRegion}>{item.region}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 15,
    marginTop: 20,
  },
  routeBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  picker: {
    padding: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pickerLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  pickerValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  routeDivider: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 20,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  passengerBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
  },
  inputLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  textInput: {
    color: '#FFF',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#121212',
  },
  typeButton: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    padding: 22,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 14,
  },
  generateButton: {
    backgroundColor: '#FFD700',
    padding: 25,
    borderRadius: 20,
    marginTop: 40,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#000',
    fontSize: 22,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    height: '70%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  modalTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    color: '#FFF',
    fontSize: 18,
  },
  modalItemRegion: {
    color: '#666',
    fontSize: 12,
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});

export default GeneratorScreen;
