const AnimatedCard = ({ label, value, color }) => {
  const scale = new Animated.Value(1);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, { borderLeftColor: color, transform: [{ scale }] }]}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={[styles.cardValue, { color: color }]}>₹{value}</Text>
      </Animated.View>
    </Pressable>
  );
};
