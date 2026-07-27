import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from 'react-native';

type Props = ScrollViewProps & {
  bottomOffset?: number;
};

/**
 * Android сам ужимает окно под клавиатуру (softwareKeyboardLayoutMode: resize),
 * поэтому KeyboardAvoidingView там компенсировал высоту второй раз: содержимое
 * схлопывалось, поле ввода уезжало из-под пальца и набрать ответ было нельзя.
 * Обёртка нужна только на iOS.
 */
export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = 'handled',
  bottomOffset = 0,
  ...props
}: Props) {
  const scroll = (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
      {...props}
    >
      {children}
    </ScrollView>
  );

  if (Platform.OS !== 'ios') return scroll;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={bottomOffset}
    >
      {scroll}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
