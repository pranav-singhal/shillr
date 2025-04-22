import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '@/contexts/ThemeContext';

interface PortfolioChartProps {
  timeFrame: string;
}

const generateMockData = (timeFrame: string) => {
  const now = new Date();
  const data = [];
  
  switch (timeFrame) {
    case '1D':
      // Generate hourly data for 1 day
      for (let i = 0; i < 24; i++) {
        data.push(Math.random() * 10 + 90);
      }
      break;
    case '1W':
      // Generate daily data for 1 week
      for (let i = 0; i < 7; i++) {
        data.push(Math.random() * 15 + 85);
      }
      break;
    case '1M':
      // Generate data for 1 month
      for (let i = 0; i < 30; i++) {
        data.push(Math.random() * 25 + 75);
      }
      break;
    case '3M':
      // Generate data for 3 months
      for (let i = 0; i < 12; i++) {
        data.push(Math.random() * 30 + 70);
      }
      break;
    case 'ALL':
      // Generate data for all time
      for (let i = 0; i < 20; i++) {
        data.push(Math.random() * 40 + 60);
      }
      break;
    default:
      for (let i = 0; i < 24; i++) {
        data.push(Math.random() * 10 + 90);
      }
  }
  
  // Sort for a smoother trend
  return data.sort((a, b) => 0.5 - Math.random());
};

export default function PortfolioChart({ timeFrame }: PortfolioChartProps) {
  const { colors, isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width - 32;
  const chartData = generateMockData(timeFrame);
  
  // Generate labels based on timeframe
  const generateLabels = () => {
    switch (timeFrame) {
      case '1D':
        return ['', '6am', '12pm', '6pm', ''];
      case '1W':
        return ['', 'Mon', 'Wed', 'Fri', ''];
      case '1M':
        return ['', '1w', '2w', '3w', ''];
      case '3M':
        return ['', 'May', 'Jun', 'Jul', ''];
      case 'ALL':
        return ['', '2022', '2023', '2024', ''];
      default:
        return ['', '', '', '', ''];
    }
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: generateLabels(),
          datasets: [
            {
              data: chartData,
            },
          ],
        }}
        width={screenWidth}
        height={200}
        yAxisSuffix="%"
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: 'transparent',
          backgroundGradientFrom: 'transparent',
          backgroundGradientTo: 'transparent',
          decimalPlaces: 0,
          color: (opacity = 1) => colors.tint,
          labelColor: (opacity = 1) => colors.neutral,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '0',
            strokeWidth: '0',
          },
          propsForBackgroundLines: {
            stroke: colors.border,
            strokeDasharray: '',
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={false}
        withDots={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});