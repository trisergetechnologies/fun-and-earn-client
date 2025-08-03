import { Text, View, StyleSheet } from 'react-native';

export default function DreamCashInfo() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ℹ️ About Dream Cash</Text>
      <Text style={styles.text}>
        Dream Cash is a virtual balance you earn through your activity on the app.{"\n\n"}
        It can be used for shopping or can be withdrawn, as per the options available.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f6f8',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#555',
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666',
  },
});
