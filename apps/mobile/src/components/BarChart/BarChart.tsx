import { View, StyleSheet, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';

export interface BarChartDataItem {
	value: number;
	label: string;
}

interface BarChartProps {
	data: BarChartDataItem[];
	barWidth?: number;
	roundedTop?: boolean;
	roundedBottom?: boolean;
	hideRules?: boolean;
	xAxisThickness?: number;
	yAxisThickness?: number;
	yAxisTextStyle?: TextStyle;
	xAxisLabelTextStyle?: TextStyle;
	frontColor?: string;
}

export function BarChart({
	data,
	barWidth = 22,
	roundedTop,
	roundedBottom,
	hideRules,
	xAxisThickness = 1,
	yAxisThickness = 1,
	yAxisTextStyle,
	xAxisLabelTextStyle,
	frontColor = '#3b82f6',
}: BarChartProps) {
	const values = data.map((d) => d.value);
	const maxValue = Math.max(1, ...values);
	const chartHeight = 160;

	const yLabels = [0, maxValue * 0.5, maxValue].map((v) => `£${v.toFixed(0)}`);

	return (
		<View style={styles.container}>
			<View style={styles.chartRow}>
				{!hideRules && (
					<View style={[styles.yAxis, { width: Math.max(yAxisThickness, 28) }]}>
						{yLabels.map((label, i) => (
							<Text
								key={i}
								variant="bodySmall"
								style={[styles.yLabel, yAxisTextStyle]}
								numberOfLines={1}
							>
								{label}
							</Text>
						))}
					</View>
				)}

				<View style={styles.barsArea}>
					{!hideRules && (
						<View style={StyleSheet.absoluteFill}>
							{yLabels.map((_, i) => (
								<View
									key={i}
									style={[
										styles.rule,
										{ top: (i / (yLabels.length - 1)) * chartHeight },
									]}
								/>
							))}
						</View>
					)}

					<View style={styles.barsRow}>
						{data.map((item, index) => {
							const barHeight = (item.value / maxValue) * chartHeight;
							return (
								<View
									key={index}
									style={{
										flex: 1,
										justifyContent: 'flex-end',
										alignItems: 'center',
									}}
								>
									<View
										style={{
											width: barWidth,
											height: Math.max(barHeight, 4),
											backgroundColor: frontColor,
											borderTopLeftRadius: roundedTop ? 4 : 0,
											borderTopRightRadius: roundedTop ? 4 : 0,
											borderBottomLeftRadius: roundedBottom ? 4 : 0,
											borderBottomRightRadius: roundedBottom ? 4 : 0,
										}}
									/>
									<Text
										variant="bodySmall"
										style={[
											styles.xLabel,
											xAxisLabelTextStyle,
										]}
										numberOfLines={1}
									>
										{item.label}
									</Text>
								</View>
							);
						})}
					</View>
				</View>
			</View>

			<View
				style={[
					styles.xAxis,
					{ height: xAxisThickness, backgroundColor: frontColor },
				]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 8,
	},
	chartRow: {
		flexDirection: 'row',
		alignItems: 'stretch',
	},
	yAxis: {
		justifyContent: 'space-between',
		marginRight: 8,
	},
	yLabel: {
		fontSize: 10,
		textAlign: 'right',
	},
	barsArea: {
		flex: 1,
	},
	rule: {
		position: 'absolute',
		left: 0,
		right: 0,
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.06)',
	},
	barsRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		height: 160,
	},
	xLabel: {
		marginTop: 6,
		fontSize: 9,
		textAlign: 'center',
	},
	xAxis: {
		marginTop: 0,
		opacity: 0.3,
	},
});
