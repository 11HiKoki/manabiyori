import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  useWindowDimensions,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const { height: viewportHeight, width: viewportWidth } = useWindowDimensions();
  const [formMode, setFormMode] = useState<"auth" | "forgot" | "reset">(mode === "passwordReset" ? "reset" : "auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [feedback, setFeedback] = useState<AuthFormResult | null>(null);
  const [loadingAction, setLoadingAction] = useState<"passwordReset" | "passwordUpdate" | "signIn" | "signUp" | null>(null);

  const activeFormMode = mode === "passwordReset" ? "reset" : formMode;
  const compact = viewportHeight < 680 || viewportWidth < 350;

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
      <ScrollView
        contentContainerStyle={[styles.content, compact ? styles.contentCompact : null]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.brand}>
          <View style={[styles.logo, compact ? styles.logoCompact : null]}>
            <Image source={appIcon} style={[styles.logoImage, compact ? styles.logoImageCompact : null]} />
          </View>
          <Text style={[styles.appName, compact ? styles.appNameCompact : null]}>まなびより</Text>
          <Text style={styles.tagline}>気づきと人との記録帳</Text>
        </View>

        <View style={[styles.panel, compact ? styles.panelCompact : null]}>
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
              <PasswordInput
                autoComplete="new-password"
                label="新しいパスワード"
                placeholder="6文字以上"
                value={password}
                onChangeText={setPassword}
              />
              <PasswordInput
                autoComplete="new-password"
                label="新しいパスワード（確認）"
                placeholder="もう一度入力"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <LabeledInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                label="メールアドレス"
                placeholder="name@example.com"
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
              />
              {activeFormMode === "auth" ? (
                <PasswordInput
                  autoComplete="current-password"
                  label="パスワード"
                  placeholder="パスワードを入力"
                  value={password}
                  onChangeText={setPassword}
                />
              ) : null}
            </View>
          )}

          {feedback ? (
            <Text accessibilityLiveRegion="polite" style={[styles.feedback, feedback.error ? styles.errorText : styles.messageText]}>
              {feedback.error ?? feedback.message}
            </Text>
          ) : notice ? (
            <Text accessibilityLiveRegion="polite" style={[styles.feedback, styles.errorText]}>{notice}</Text>
          ) : null}

          <View style={styles.actions}>
            {activeFormMode === "reset" ? (
              <PrimaryButton
                disabled={loadingAction !== null}
                icon="key-outline"
                label={loadingAction === "passwordUpdate" ? "更新中" : "新しいパスワードを保存"}
                loading={loadingAction === "passwordUpdate"}
                onPress={updatePassword}
              />
            ) : activeFormMode === "forgot" ? (
              <>
                <PrimaryButton
                  disabled={loadingAction !== null}
                  icon="mail-outline"
                  label={loadingAction === "passwordReset" ? "送信中" : "再設定メールを送る"}
                  loading={loadingAction === "passwordReset"}
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
                  loading={loadingAction === "signIn"}
                  onPress={() => submit("signIn")}
                />
                <PrimaryButton
                  disabled={loadingAction !== null}
                  icon="person-add-outline"
                  label={loadingAction === "signUp" ? "登録中" : "新規登録"}
                  loading={loadingAction === "signUp"}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type LabeledInputProps = TextInputProps & {
  label: string;
};

function LabeledInput({ label, ...inputProps }: LabeledInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputFrame, focused ? styles.inputFrameFocused : null]}>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
      </View>
    </View>
  );
}

function PasswordInput({ label, ...inputProps }: LabeledInputProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputFrame, focused ? styles.inputFrameFocused : null]}>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          autoCapitalize="none"
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible}
          style={styles.input}
        />
        <Pressable
          accessibilityLabel={visible ? `${label}を隠す` : `${label}を表示`}
          accessibilityRole="button"
          hitSlop={4}
          onPress={() => setVisible((current) => !current)}
          style={({ pressed }) => [styles.visibilityButton, pressed ? styles.visibilityButtonPressed : null]}
        >
          <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    width: "100%"
  },
  content: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    width: "100%"
  },
  contentCompact: {
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl
  },
  brand: {
    alignItems: "center",
    gap: spacing.sm,
    width: "100%"
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
  logoCompact: {
    height: 48,
    width: 48
  },
  logoImage: {
    borderRadius: 8,
    height: 58,
    width: 58
  },
  logoImageCompact: {
    height: 48,
    width: 48
  },
  appName: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900"
  },
  appNameCompact: {
    fontSize: 28
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
    gap: spacing.xl,
    maxWidth: 380,
    padding: spacing.xl,
    width: "100%",
    ...shadows.soft
  },
  panelCompact: {
    gap: spacing.lg,
    padding: spacing.lg
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
  field: {
    gap: spacing.sm
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800"
  },
  inputFrame: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 50,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs
  },
  inputFrameFocused: {
    borderColor: colors.accentDark,
    borderWidth: 2,
    paddingLeft: spacing.lg - 1,
    paddingRight: spacing.xs - 1
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
    color: colors.text,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingRight: spacing.sm
  },
  visibilityButton: {
    alignItems: "center",
    borderRadius: radii.sm,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  visibilityButtonPressed: {
    backgroundColor: colors.surfaceMuted
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
