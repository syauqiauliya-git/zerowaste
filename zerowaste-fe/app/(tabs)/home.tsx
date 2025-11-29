import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import BarChart from '../../components/charts/BarChart'
import Svg, { G, Circle } from 'react-native-svg'
import { stats, trend, categories } from './home.mock'

export default function HomeScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('Last Week')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const periods = ['Last Week', 'Last Month', 'Last Year']

  const barData = trend.map((t) => {
    const parts = (t.date || '').split('/')
    let iso = t.date
    if (parts.length === 2) {
      const [d, m] = parts
      const year = new Date().getFullYear()
      const day = d.padStart ? d.padStart(2, '0') : (`0${d}`).slice(-2)
      const month = m.padStart ? m.padStart(2, '0') : (`0${m}`).slice(-2)
      iso = `${year}-${month}-${day}`
    }
    return { _id: iso, totalWaste: t.value }
  })

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statNumber}>{stats.totalReduction}%</Text>
          <Text style={styles.statLabel}>Total Reduction</Text>
          <Text style={styles.statSub}>↑ 8% from last week</Text>
        </View>
        <View style={[styles.statCard, styles.statCardAccent]}>
          <Text style={styles.statNumber}>{stats.avgRating}</Text>
          <Text style={styles.statLabel}>Average Rating</Text>
          <Text style={styles.statSub}>↑ 0.3 from last week</Text>
        </View>
      </View>

      {/* Food Waste Trend Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Food Waste Trend</Text>

          {/* Dropdown */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={styles.dropdownButtonText}>{selectedPeriod}</Text>
              <Text style={[styles.dropdownIcon, isDropdownOpen && styles.dropdownIconOpen]}>▼</Text>
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {periods.map((period, index) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.dropdownItem,
                      selectedPeriod === period && styles.dropdownItemActive,
                      index === periods.length - 1 && styles.dropdownItemLast
                    ]}
                    onPress={() => {
                      setSelectedPeriod(period)
                      setIsDropdownOpen(false)
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedPeriod === period && styles.dropdownItemTextActive
                    ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.chartContainer}>
          {/* Chart area (BarChart renders axes and grid) */}
          <View style={styles.chartArea}>
            <BarChart data={barData} height={220} />
          </View>
        </View>
      </View>

      {/* Food Waste Category Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Food Waste Category</Text>
        <View style={styles.categoryRow}>
          {/* Donut Chart (SVG) */}
          <View style={styles.donutContainer}>
            <Svg width={140} height={140} viewBox="0 0 140 140">
              <G rotation={-90} origin="70,70">
                {
                  (() => {
                    const size = 140
                    const center = size / 2
                    const strokeWidth = 35
                    const radius = center - strokeWidth / 2
                    const circumference = 2 * Math.PI * radius
                    let cumulative = 0
                    return categories.map((cat, idx) => {
                      const slice = (cat.percent / 100) * circumference
                      const dashArray = `${slice} ${circumference - slice}`
                      const offset = circumference * (1 - cumulative / 100)
                      cumulative += cat.percent
                      return (
                        <Circle
                          key={cat.label}
                          cx={center}
                          cy={center}
                          r={radius}
                          stroke={cat.color}
                          strokeWidth={strokeWidth}
                          strokeDasharray={dashArray}
                          strokeDashoffset={offset}
                          strokeLinecap="butt"
                          fill="transparent"
                        />
                      )
                    })
                  })()
                }
              </G>
            </Svg>
            <View style={styles.donutHole} />
          </View>

          {/* Legend */}
          <View style={styles.categoryList}>
            {categories.map((c) => (
              <View key={c.label} style={styles.categoryItem}>
                <View style={[styles.categorySwatch, { backgroundColor: c.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryLabel}>
                    {c.label}: {c.percent}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  container: {
    padding: 16,
    paddingBottom: 32
  },

  // Stats Cards
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    justifyContent: 'center'
  },
  statCardPrimary: {
    backgroundColor: '#059669',
    borderWidth: 0,
    borderColor: 'transparent'
  },
  statCardAccent: {
    backgroundColor: '#3B82F6',
    borderWidth: 0,
    borderColor: 'transparent'
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  statLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  statSub: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontSize: 12
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6F9F0'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 10
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#064E3B'
  },

  // Dropdown
  dropdownWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    minWidth: 130,
  },
  dropdownButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  dropdownIconOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemActive: {
    backgroundColor: '#F0FDF4',
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  dropdownItemTextActive: {
    color: '#064E3B',
  },

  // Area Chart
  chartContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  yAxisLabels: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingBottom: 20
  },
  yAxisText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'right'
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    marginBottom: 20
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F3F4F6'
  },
  svgChart: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 20,
  },
  xAxisLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 20,
    flexDirection: 'row'
  },
  xAxisText: {
    position: 'absolute',
    fontSize: 10,
    color: '#9CA3AF',
    transform: [{ translateX: -15 }]
  },

  // Donut Chart
  categoryRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    marginTop: 16
  },
  donutContainer: {
    width: 140,
    height: 140,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  donutSegment: {
    position: 'absolute',
    width: 140,
    height: 140,
    overflow: 'hidden',
    borderRadius: 70
  },
  donutSlice: {
    width: 140,
    height: 140,
    borderRadius: 70,
    transformOrigin: 'center'
  },
  donutHole: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    zIndex: 100
  },

  // Category Legend
  categoryList: {
    flex: 1
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  categorySwatch: {
    width: 14,
    height: 14,
    borderRadius: 3
  },
  categoryLabel: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13
  },
})
