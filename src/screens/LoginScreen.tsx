import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { colors, radii, shadows, spacing } from "../theme";

type LoginScreenProps = {
  onSignIn: (email: string, password: string) => Promise<AuthFormResult>;
  onSignUp: (email: string, password: string) => Promise<AuthFormResult>;
};

export type AuthFormResult = {
  error?: string;
  message?: string;
};

export function LoginScreen({ onSignIn, onSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<AuthFormResult | null>(null);
  const [loadingAction, setLoadingAction] = useState<"signIn" | "signUp" | null>(null);

  const submit = async (action: "signIn" | "signUp") => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setFeedback({ error: "メールアドレスとパスワードを入力してください。" });
      return;
    }

    setFeedback(null);
    setLoadingAction(action);

    const result = action === "signIn" ? await onSignIn(trimmedEmail, password) : await onSignUp(trimmedEmail, password);
    setFeedback(result);
    setLoadingAction(null);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Ionicons name="leaf-outline" size={30} color={colors.accentDark} />
          </View>
          <Text style={styles.appName}>まなびより</Text>
          <Text style={styles.tagline}>気づきと人との記録帳</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.title}>おかえりなさい</Text>
            <Text style={styles.subtitle}>仕事も暮らしも、静かに振り返れる場所です。</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="メールアドレス"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              autoCapitalize="none"
              placeholder="パスワード"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {feedback ? (
            <Text style={[styles.feedback, feedback.error ? styles.errorText : styles.messageText]}>{feedback.error ?? feedback.message}</Text>
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton
              disabled={loadingAction !== null}
              icon="log-in-outline"
              label={loadingAction === "signIn" ? "ログイン中" : "ログイン"}
              onPress={() => submit("signIn")}
            />
            <PrimaryButton
              disabled={loadingAction !== null}
              icon="person-add-outline"
              label={loadingAction === "signUp" ? "登録中" : "新規登録"}
              variant="ghost"
              onPress={() => submit("signUp")}
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    alignSelf: "center",
    flex: 1,
    justifyContent: "center",
    gap: spacing.xxl,
    maxWidth: 560,
    padding: spacing.xl
  },
  brand: {
    alignItems: "center",
    gap: spacing.sm
  },
  logo: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    width: 58
  },
  appName: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900"
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 15
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xl,
    padding: spacing.xl,
    ...shadows.soft
  },
  panelHeader: {
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21
  },
  form: {
    gap: spacing.md
  },
  actions: {
    gap: spacing.md
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: spacing.lg
  },
  feedback: {
    borderRadius: radii.md,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
    padding: spacing.md
  },
  errorText: {
    backgroundColor: colors.dangerSoft,
    color: colors.coral
  },
  messageText: {
    backgroundColor: colors.successSoft,
    color: colors.accentDark
  }
});
