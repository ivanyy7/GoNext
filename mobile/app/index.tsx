import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';

export default function HomeScreen() {
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);

  const handleButtonPress = () => {
    setSnackbarVisible(true);
  };

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
  };

  return (
    <>
      <AppHeader title="GoNext" />

      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.text}>
          Приветствую, Иван!
        </Text>

        <PrimaryButton onPress={handleButtonPress}>Нажми меня</PrimaryButton>
      </View>

      <Snackbar visible={snackbarVisible} onDismiss={handleDismissSnackbar} duration={2000}>
        Кнопка нажата
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    marginBottom: 16,
    textAlign: 'center',
  },
});

