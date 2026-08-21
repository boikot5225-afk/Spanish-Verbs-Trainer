import React, { useState } from 'react';
import {
  Alert,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  createBackupText,
  inspectBackupText,
  restoreBackupText,
  type BackupSummary,
} from '../../utils/storage';

function describe(summary: BackupSummary): string {
  const date = new Date(summary.createdAt);
  const dateText = Number.isNaN(date.getTime())
    ? 'дата неизвестна'
    : date.toLocaleString('ru-RU');

  return [
    `Создана: ${dateText}`,
    `Сдано тем: ${summary.passedLessons}`,
    `Времён со статистикой: ${summary.trainedTenses}`,
    `Записей истории: ${summary.historyItems}`,
  ].join('\n');
}

export default function BackupTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 84 : insets.bottom + 72;

  const makeBackup = async (): Promise<string | null> => {
    if (busy) return null;
    setBusy(true);
    try {
      const text = await createBackupText();
      setLastStatus('Резервная копия создана.');
      return text;
    } catch (error) {
      Alert.alert('Не удалось создать копию', error instanceof Error ? error.message : 'Неизвестная ошибка.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const copyBackup = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = await makeBackup();
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setLastStatus('Копия помещена в буфер обмена. Сохраните её в заметках или отправьте себе.');
    Alert.alert(
      'Скопировано',
      'Резервная копия находится в буфере обмена. Не оставляйте её только там: буфер может очиститься.',
    );
  };

  const shareBackup = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = await makeBackup();
    if (!text) return;
    await Share.share({
      title: 'French Verbs Trainer — резервная копия',
      message: text,
    });
    setLastStatus('Копия передана через системное меню «Поделиться».');
  };

  const finishRestore = (summary: BackupSummary) => {
    setLastStatus('Данные восстановлены. После перезапуска приложение загрузит их полностью.');
    Alert.alert(
      'Данные восстановлены',
      `${describe(summary)}\n\nПриложение нужно полностью перезапустить.`,
      Platform.OS === 'android'
        ? [
            { text: 'Позже', style: 'cancel' },
            { text: 'Закрыть приложение', onPress: () => BackHandler.exitApp() },
          ]
        : [{ text: 'Понятно' }],
    );
  };

  const restoreFromClipboard = async () => {
    if (busy) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setBusy(true);
    try {
      const text = await Clipboard.getStringAsync();
      const summary = inspectBackupText(text);

      Alert.alert(
        'Восстановить эту копию?',
        `${describe(summary)}\n\nТекущий прогресс, настройки и история будут заменены. Незавершённый тест не переносится.`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Восстановить',
            style: 'destructive',
            onPress: () => {
              void restoreBackupText(text)
                .then(finishRestore)
                .catch(error => {
                  Alert.alert(
                    'Не удалось восстановить',
                    error instanceof Error ? error.message : 'Неизвестная ошибка.',
                  );
                });
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'Копия не распознана',
        error instanceof Error ? error.message : 'В буфере нет корректной резервной копии.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Данные</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Резервная копия и перенос прогресса</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}>
        <View style={[styles.notice, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
          <View style={styles.noticeTextWrap}>
            <Text style={[styles.noticeTitle, { color: colors.foreground }]}>Что сохраняется</Text>
            <Text style={[styles.noticeBody, { color: colors.mutedForeground }]}>
              Сданные и открытые темы, медали мини-тренировок, статистика времён,
              история тестов, настройки теста и озвучки. Незавершённая сессия не переносится.
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Создать резервную копию</Text>
          <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
            Перед удалением приложения обязательно сохраните копию вне буфера обмена —
            например, в заметках, Telegram или файле на компьютере.
          </Text>

          <Pressable
            disabled={busy}
            onPress={copyBackup}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
              busy && { opacity: 0.5 },
            ]}
          >
            <Ionicons name="copy-outline" size={19} color={colors.primaryForeground} />
            <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
              Скопировать
            </Text>
          </Pressable>

          <Pressable
            disabled={busy}
            onPress={shareBackup}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.primary },
              pressed && { opacity: 0.7 },
              busy && { opacity: 0.5 },
            ]}
          >
            <Ionicons name="share-outline" size={19} color={colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Поделиться копией</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Восстановить</Text>
          <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
            Скопируйте сохранённый текст целиком, затем нажмите кнопку ниже. Перед записью
            приложение покажет дату и состав найденной копии.
          </Text>

          <Pressable
            disabled={busy}
            onPress={restoreFromClipboard}
            style={({ pressed }) => [
              styles.restoreButton,
              { borderColor: colors.destructive },
              pressed && { opacity: 0.7 },
              busy && { opacity: 0.5 },
            ]}
          >
            <Ionicons name="cloud-download-outline" size={19} color={colors.destructive} />
            <Text style={[styles.restoreButtonText, { color: colors.destructive }]}>Восстановить из буфера</Text>
          </Pressable>
        </View>

        <View style={[styles.warning, { borderColor: colors.border }]}>
          <Ionicons name="warning-outline" size={20} color={colors.mutedForeground} />
          <Text style={[styles.warningText, { color: colors.mutedForeground }]}>
            Новая подпись Android не может читать закрытое хранилище старой установки.
            Поэтому для перехода с 1.1.1 сначала извлекается резервная копия старых данных,
            и только потом удаляется приложение.
          </Text>
        </View>

        {lastStatus ? (
          <Text style={[styles.status, { color: colors.mutedForeground }]}>{lastStatus}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  content: { padding: 16, gap: 14 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  noticeTextWrap: { flex: 1, gap: 5 },
  noticeTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  noticeBody: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular' },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 12 },
  cardTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  cardBody: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular' },
  primaryButton: { minHeight: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14 },
  primaryButtonText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  secondaryButton: { minHeight: 46, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14 },
  secondaryButtonText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  restoreButton: { minHeight: 46, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14 },
  restoreButtonText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  warning: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderTopWidth: 1, paddingTop: 14 },
  warningText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  status: { textAlign: 'center', fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
});
