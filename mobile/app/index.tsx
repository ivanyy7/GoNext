import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Snackbar, Text } from 'react-native-paper';

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
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.text}>
          Приветствую, Иван!
        </Text>

        <Button mode="contained" onPress={handleButtonPress}>
          Нажми меня
        </Button>
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
    color: '#000000',
    fontSize: 20,
    fontWeight: '600',
  },
});

