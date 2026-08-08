import { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import appIcon from "../../assets/brand-icon.png";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, radii, shadows, spacing } from "../theme";

type LoginScreenProps = {
  mode?: "default" | "passwordReset";
  notice?: string | null;
  onSignIn: (email: string, password: string) => Promise<AuthFormResult>;
  onSignUp: (email: string, password: string) => Promise<AuthFormResult>;
  onPasswordResetRequest: (email: string) => Promise<AuthFormResult>;
  onPasswordUpdate: (password: string) => Promise<AuthFormResult>;
};

export type AuthFormResult = {
  error?: string;
  message?: string;
};

export function LoginScreen({
  mode = "default",
  notice = null,
  onPasswordResetRequest,
  onPasswordUpdate,
  onSignIn,
  onSignUp
}: LoginScreenProps) {
  const [formMode, setFormMode] = useState<"auth" | "forgot" | "reset">(mode === "passwordReset" ? "reset" : "auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [feedback, setFeedback] = useState<AuthFormResult | null>(null);
  const [loadingAction, setLoadingAction] = useState<"passwordReset" | "passwordUpdate" | "signIn" | "signUp" | null>(null);

  const activeFormMode = mode === "passwordReset" ? "reset" : formMode;

  useEffect(() => {
    if (mode === "passwordReset") {
      setFormMode("reset");
      setFeedback({ message: "新しいパスワードを入力してください。" });
    }
  }, [mode]);

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

  const requestPasswordReset = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setFeedback({ error: "再設定メールを送るメールアドレスを入力してください。" });
      return;
    }

    setFeedback(null);
    setLoadingAction("passwordReset");

    const result = await onPasswordResetRequest(trimmedEmail);
    setFeedback(result);
    setLoadingAction(null);
  };

  const updatePassword = async () => {
    if (!password || !passwordConfirm) {
      setFeedback({ error: "新しいパスワードを2回入力してください。" });
      return;
    }

    if (password.length < 6) {
      setFeedback({ error: "パスワードは6文字以上で入力してください。" });
      return;
    }

    if (password !== passwordConfirm) {
      setFeedback({ error: "確認用パスワードが一致していません。" });
      return;
    }

    setFeedback(null);
    setLoadingAction("passwordUpdate");

    const result = await onPasswordUpdate(password);
    setFeedback(result);
    setLoadingAction(null);

    if (!result.error) {
      setPassword("");
      setPasswordConfirm("");
    }
  };

  const resetToLogin = () => {
    setFormMode("auth");
    setFeedback(null);
    setPassword("");
    setPasswordConfirm("");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Image source={appIcon} style={styles.logoImage} />
          </View>
          <Text style={styles.appName}>まなびより</Text>
          <Text style={styles.tagline}>気づきと人との記録帳</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.title}>{activeFormMode === "reset" ? "パスワード再設定" : activeFormMode === "forgot" ? "パスワードを再設定" : "おかえりなさい"}</Text>
            <Text style={styles.subtitle}>
              {activeFormMode === "reset"
                ? "新しいパスワードを設定すると、そのまま使い続けられます。"
                : activeFormMode === "forgot"
                  ? "登録済みのメールアドレスに、再設定用のリンクを送ります。"
                  : "仕事も暮らしも、静かに振り返れる場所です。"}
            </Text>
          </View>

          {activeFormMode === "reset" ? (
            <View style={styles.form}>
              <TextInput
                autoCapitalize="none"
                placeholder="新しいパスワード"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                autoCapitalize="none"
                placeholder="新しいパスワードをもう一度"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={styles.input}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
              />
            </View>
          ) : (
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
              {activeFormMode === "auth" ? (
                <TextInput
                  autoCapitalize="none"
                  placeholder="パスワード"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              ) : null}
            </View>
          )}

          {feedback ? (
            <Text style={[styles.feedback, feedback.error ? styles.errorText : styles.messageText]}>{feedback.error ?? feedback.message}</Text>
          ) : notice ? (
            <Text style={[styles.feedback, styles.messageText]}>{notice}</Text>
          ) : null}

          <View style={styles.actions}>
            {activeFormMode === "reset" ? (
              <PrimaryButton
                disabled={loadingAction !== null}
                icon="key-outline"
                label={loadingAction === "passwordUpdate" ? "更新中" : "新しいパスワードを保存"}
                onPress={updatePassword}
              />
            ) : activeFormMode === "forgot" ? (
              <>
                <PrimaryButton
                  disabled={loadingAction !== null}
                  icon="mail-outline"
                  label={loadingAction === "passwordReset" ? "送信中" : "再設定メールを送る"}
                  onPress={requestPasswordReset}
                />
                <PrimaryButton disabled={loadingAction !== null} icon="arrow-back-outline" label="ログインに戻る" variant="ghost" onPress={resetToLogin} />
              </>
            ) : (
              <>
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
                <Pressable
                  accessibilityRole="button"
                  disabled={loadingAction !== null}
                  onPress={() => {
                    setFormMode("forgot");
                    setFeedback(null);
                    setPassword("");
                  }}
                  style={styles.linkButton}
                >
                  <Text style={styles.linkText}>パスワードを忘れた方</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    alignItems: "center",
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    boxSizing: "border-box",
    flex: 1,
    justifyContent: "center",
    gap: spacing.xxl,
    padding: spacing.xl,
    width: "100%"
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
  logoImage: {
    borderRadius: 8,
    height: 58,
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
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    boxSizing: "border-box",
    gap: spacing.xl,
    maxWidth: "88%",
    padding: spacing.xl,
    width: 342,
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
  linkButton: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  linkText: {
    color: colors.accentDark,
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline"
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
