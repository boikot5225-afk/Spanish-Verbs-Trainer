import { Platform, ScrollView, ScrollViewProps } from 'react-native';

type Props = ScrollViewProps & {
  bottomOffset?: number;
};

export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = 'handled',
  bottomOffset: _bottomOffset,
  ...props
}: Props) {
  return (
    <ScrollView
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
