import { View, Text, StyleSheet, Dimensions } from "react-native";

interface TrendData {
  _id: string;
  totalWaste: number;
}

interface BarChartProps {
  data: TrendData[];
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_HEIGHT = 200;
const BAR_SPACING = 3;
const CHART_PADDING_HORIZONTAL = 60;
const X_AXIS_HEIGHT = 25;

export default function BarChart({ data, height = CHART_HEIGHT }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>No trend data available</Text>
      </View>
    );
  }

  // Limit to latest 7 data points
  const displayData = data.slice(-7);

  // Calculate max value for scaling
  const maxValue = Math.max(...displayData.map((item) => item.totalWaste), 1);
  
  // Calculate available width for bars
  const availableWidth = SCREEN_WIDTH - CHART_PADDING_HORIZONTAL - 60; // Account for padding and y-axis
  const totalBarSpacing = (displayData.length - 1) * BAR_SPACING;
  const barWidth = Math.max(
    (availableWidth - totalBarSpacing) / displayData.length,
    15
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  const chartHeight = height - X_AXIS_HEIGHT - 20; // Reserve space for x-axis labels and padding

  return (
    <View style={[styles.container, { height }]}>
      {/* Y-axis labels */}
      <View style={styles.yAxisContainer}>
        <View style={[styles.yAxisLabels, { height: chartHeight }]}>
          <Text style={styles.yAxisLabel}>{maxValue.toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{(maxValue * 0.75).toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{(maxValue * 0.5).toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{(maxValue * 0.25).toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>0</Text>
        </View>
      </View>

      {/* Chart area */}
      <View style={[styles.chartArea, { height: chartHeight }]}>
        {/* Grid lines */}
        <View style={styles.gridContainer}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const topPosition = ratio * chartHeight;
            return (
              <View
                key={idx}
                style={[
                  styles.gridLine,
                  { top: topPosition },
                ]}
              />
            );
          })}
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {displayData.map((item, index) => {
            const barHeight = (item.totalWaste / maxValue) * chartHeight;
            return (
              <View key={index} style={[styles.barWrapper, { width: barWidth, marginRight: BAR_SPACING }]}>
                <View style={[styles.barContainer, { height: chartHeight }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, 2),
                        width: barWidth,
                      },
                    ]}
                  >
                    {barHeight > 25 && (
                      <Text style={styles.barValue}>
                        {item.totalWaste.toFixed(1)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {displayData.map((item, index) => (
          <View key={index} style={[styles.xAxisLabelWrapper, { width: barWidth + BAR_SPACING }]}>
            <Text style={styles.xAxisLabel} numberOfLines={1}>
              {formatDate(item._id)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  yAxisContainer: {
    width: 32,
    paddingRight: 8,
  },
  yAxisLabels: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  yAxisLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "500",
  },
  chartArea: {
    flex: 1,
    position: "relative",
    marginBottom: X_AXIS_HEIGHT,
  },
  gridContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
  },
  barWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barContainer: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    backgroundColor: "#10B981",
    borderRadius: 4,
    minHeight: 2,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  barValue: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 2,
  },
  xAxisContainer: {
    position: "absolute",
    bottom: 0,
    left: 32,
    right: 8,
    flexDirection: "row",
    height: X_AXIS_HEIGHT,
  },
  xAxisLabelWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  xAxisLabel: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 20,
  },
});

