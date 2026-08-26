import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PAP {
  code_pap: string;
  nom: string;
  prenom: string;
  statut: string;
  montant_valide: number;
  montant_paye: number;
}

interface DashboardStats {
  totalPap: number;
  totalPaye: number;
  totalValide: number;
  tauxCompletion: number;
  montantValide: number;
  montantPaye: number;
}

export default function PAPDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [paps, setPaps] = useState<PAP[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Essayer charger depuis API
      try {
        const response = await fetch('https://apix-papa.vercel.app/api/stats/dashboard', {
          timeout: 5000
        });
        const data = await response.json();

        setStats(data);

        // Sauvegarder pour offline
        await AsyncStorage.setItem('dashboard_stats', JSON.stringify(data));
        setOffline(false);
      } catch (apiError) {
        // Fallback: charger depuis cache local
        const cached = await AsyncStorage.getItem('dashboard_stats');
        if (cached) {
          setStats(JSON.parse(cached));
          setOffline(true);
        } else {
          throw apiError;
        }
      }

      // Charger PAP
      const papResponse = await fetch('https://apix-papa.vercel.app/api/pap/list');
      const papData = await papResponse.json();
      setPaps(papData.data || []);
      await AsyncStorage.setItem('pap_list', JSON.stringify(papData.data));

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      // Charger depuis cache
      const cachedPaps = await AsyncStorage.getItem('pap_list');
      if (cachedPaps) {
        setPaps(JSON.parse(cachedPaps));
        setOffline(true);
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006B3F" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 APIX-PAP Mobile</Text>
          {offline && <Text style={styles.offlineIndicator}>🔴 Hors ligne</Text>}
        </View>

        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalPap}</Text>
              <Text style={styles.statLabel}>Total PAP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.tauxCompletion}%</Text>
              <Text style={styles.statLabel}>Complétude</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalPaye}</Text>
              <Text style={styles.statLabel}>Payés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {(stats.montantPaye / 1000000).toFixed(0)}M
              </Text>
              <Text style={styles.statLabel}>Montant Payé</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PAPList')}
          >
            <Text style={styles.actionButtonText}>👥 Registre PAP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.actionButtonText}>🔍 Rechercher</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.actionButtonText}>🔔 Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionButtonText}>⚙️ Paramètres</Text>
          </TouchableOpacity>
        </View>

        {/* Recent PAPs */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Derniers PAP</Text>
          {paps.slice(0, 5).map((pap) => (
            <TouchableOpacity
              key={pap.code_pap}
              style={styles.papCard}
              onPress={() => navigation.navigate('PAPDetail', { code: pap.code_pap })}
            >
              <View style={styles.papHeader}>
                <Text style={styles.papCode}>{pap.code_pap}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    getStatusStyle(pap.statut)
                  ]}
                >
                  <Text style={styles.statusText}>{pap.statut}</Text>
                </View>
              </View>
              <Text style={styles.papName}>{pap.nom} {pap.prenom}</Text>
              <View style={styles.papFooter}>
                <Text style={styles.papAmount}>
                  💰 {(pap.montant_paye / 1000000).toFixed(1)}M FCFA
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sync Button */}
        <TouchableOpacity
          style={styles.syncButton}
          onPress={loadDashboardData}
        >
          <Text style={styles.syncButtonText}>🔄 Synchroniser</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusStyle = (statut: string) => {
  switch (statut) {
    case 'Payé':
      return { backgroundColor: '#d4edda', borderColor: '#4caf50' };
    case 'Évalué':
      return { backgroundColor: '#d1ecf1', borderColor: '#2196f3' };
    case 'Nouveau':
      return { backgroundColor: '#fff3cd', borderColor: '#ff9800' };
    default:
      return { backgroundColor: '#e0e0e0', borderColor: '#999' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006B3F',
  },
  offlineIndicator: {
    color: '#f44336',
    fontWeight: '600',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006B3F',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#006B3F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  recentContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#006B3F',
    marginBottom: 12,
  },
  papCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  papHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  papCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#006B3F',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  papName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  papFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  papAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#006B3F',
  },
  syncButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
});
