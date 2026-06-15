import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

interface ScreenBackgroundProps {
	children: ReactNode;
}

export function ScreenBackground({ children }: ScreenBackgroundProps) {
	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<LinearGradient
				colors={['rgba(77, 217, 230, 0.12)', 'transparent']}
				start={{ x: 0.15, y: 0 }}
				end={{ x: 0.6, y: 0.5 }}
				style={StyleSheet.absoluteFill}
			/>
			<LinearGradient
				colors={['rgba(43, 139, 247, 0.10)', 'transparent']}
				start={{ x: 0.85, y: 0 }}
				end={{ x: 0.4, y: 0.45 }}
				style={StyleSheet.absoluteFill}
			/>
			{children}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
});
