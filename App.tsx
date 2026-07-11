import { Ionicons } from "@expo/vector-icons";
import type { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";

import { BottomNav } from "./src/components/BottomNav";
import { ConversationNoteFormScreen } from "./src/screens/ConversationNoteFormScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MemoDetailScreen } from "./src/screens/MemoDetailScreen";
import { MemoFormScreen } from "./src/screens/MemoFormScreen";
import { MemoListScreen } from "./src/screens/MemoListScreen";
import { PeopleListScreen } from "./src/screens/PeopleListScreen";
import { PersonDetailScreen } from "./src/screens/PersonDetailScreen";
import { PersonFormScreen } from "./src/screens/PersonFormScreen";
import { ReflectionScreen } from "./src/screens/ReflectionScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { supabase } from "./src/supabase/client";
import {
  createConversationNote,
  deleteConversationNote as deleteConversationNoteFromSupabase,
  fetchConversationNotes,
  updateConversationNote
} from "./src/supabase/conversationNotes";
import { createMemo, deleteMemo as deleteMemoFromSupabase, fetchMemos, updateMemo } from "./src/supabase/memos";
import { createPerson, deletePerson as deletePersonFromSupabase, fetchPeople, updatePerson } from "./src/supabase/people";
import { loadWeekStart, saveWeekStart } from "./src/storage/settings";
import { colors } from "./src/theme";
import type { AppRoute, ConversationNote, ConversationNoteDraft, Memo, MemoDraft, PersonDraft, PersonProfile, WeekStart } from "./src/types";

const mainRoutes: AppRoute[] = ["home", "create", "list", "reflection", "people", "settings"];
const allRoutes: AppRoute[] = [
  "login",
  "home",
  "create",
  "edit",
  "list",
  "detail",
  "reflection",
  "people",
  "personCreate",
  "personEdit",
  "personDetail",
  "conversationCreate",
  "conversationEdit",
  "settings"
];
const conversationRoutes: AppRoute[] = ["personDetail", "conversationCreate", "conversationEdit"];

type BrowserNavigationState = {
  conversationNoteId?: string;
  memoId?: string;
  personId?: string;
  route: AppRoute;
};

export default function App() {
  const [fontsLoaded] = useFonts(Ionicons.font);
  const [route, setRoute] = useState<AppRoute>("login");
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedMemoId, setSelectedMemoId] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [memosLoading, setMemosLoading] = useState(false);
  const [memosError, setMemosError] = useState<string | null>(null);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [conversationNotes, setConversationNotes] = useState<ConversationNote[]>([]);
  const [selectedConversationNoteId, setSelectedConversationNoteId] = useState("");
  const [conversationNotesLoading, setConversationNotesLoading] = useState(false);
  const [conversationNotesError, setConversationNotesError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<WeekStart>("monday");

  const applyNavigationState = (state: BrowserNavigationState, mode: "push" | "replace" = "push") => {
    setRoute(state.route);

    if (state.memoId !== undefined) {
      setSelectedMemoId(state.memoId);
    }

    if (state.personId !== undefined) {
      setSelectedPersonId(state.personId);
    }

    if (state.conversationNoteId !== undefined) {
      setSelectedConversationNoteId(state.conversationNoteId);
    }

    writeBrowserNavigationState(state, mode);
  };

  const applyRouteFromLocation = (fallbackRoute: AppRoute) => {
    const browserState = readBrowserNavigationState();

    if (!browserState || browserState.route === "login") {
      applyNavigationState({ route: fallbackRoute }, "replace");
      return;
    }

    applyNavigationState(browserState, "replace");
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) {
          return;
        }

        if (error) {
          setAuthError(error.message);
        }

        setSession(data.session);
        if (data.session) {
          applyRouteFromLocation("home");
        } else {
          applyNavigationState({ route: "login" }, "replace");
        }
        setAuthLoading(false);
      })
      .catch((error: unknown) => {
        if (!mounted) {
          return;
        }

        setAuthError(error instanceof Error ? error.message : "認証状態の確認に失敗しました。");
        setAuthLoading(false);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        applyRouteFromLocation("home");
      } else {
        applyNavigationState({ route: "login" }, "replace");
      }
      setAuthError(null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    loadWeekStart()
      .then((storedWeekStart) => {
        if (mounted) {
          setWeekStart(storedWeekStart);
        }
      })
      .catch(() => {
        if (mounted) {
          setWeekStart("monday");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!canUseBrowserHistory()) {
      return undefined;
    }

    const handlePopState = () => {
      if (!session) {
        setRoute("login");
        return;
      }

      const browserState = readBrowserNavigationState();

      if (!browserState || browserState.route === "login") {
        setRoute("home");
        return;
      }

      setRoute(browserState.route);
      setSelectedMemoId(browserState.memoId ?? "");
      setSelectedPersonId(browserState.personId ?? "");
      setSelectedConversationNoteId(browserState.conversationNoteId ?? "");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [session]);

  useEffect(() => {
    if (!session) {
      setMemos([]);
      setSelectedMemoId("");
      setMemosError(null);
      setPeople([]);
      setSelectedPersonId("");
      setPeopleError(null);
      setConversationNotes([]);
      setSelectedConversationNoteId("");
      setConversationNotesError(null);
      setConversationNotesLoading(false);
      return;
    }

    void loadMemos(session.user.id);
    void loadPeople(session.user.id);
  }, [session]);

  useEffect(() => {
    if (!session || !selectedPersonId || !conversationRoutes.includes(route)) {
      return;
    }

    void loadConversationNotes(session.user.id, selectedPersonId);
  }, [route, selectedPersonId, session]);

  const selectedMemo = useMemo(
    () => memos.find((memo) => memo.id === selectedMemoId),
    [memos, selectedMemoId]
  );

  const selectedPerson = useMemo(
    () => people.find((person) => person.id === selectedPersonId),
    [people, selectedPersonId]
  );

  const selectedConversationNote = useMemo(
    () => conversationNotes.find((conversationNote) => conversationNote.id === selectedConversationNoteId),
    [conversationNotes, selectedConversationNoteId]
  );

  const navigate = (nextRoute: AppRoute) => {
    applyNavigationState({
      conversationNoteId: selectedConversationNoteId || undefined,
      memoId: selectedMemoId || undefined,
      personId: selectedPersonId || undefined,
      route: nextRoute
    });
  };

  const openMemo = (memoId: string) => {
    applyNavigationState({ memoId, route: "detail" });
  };

  const openPerson = (personId: string) => {
    setConversationNotes([]);
    setConversationNotesError(null);
    applyNavigationState({ conversationNoteId: "", personId, route: "personDetail" });
  };

  const loadMemos = async (userId: string) => {
    setMemosLoading(true);
    setMemosError(null);

    const result = await fetchMemos(userId);

    if (result.error) {
      setMemosError(result.error);
    } else {
      setMemos(result.memos);
      setSelectedMemoId((current) => (current && result.memos.some((memo) => memo.id === current) ? current : result.memos[0]?.id ?? ""));
    }

    setMemosLoading(false);
  };

  const addMemo = async (draft: MemoDraft) => {
    if (!session) {
      return { error: "ログインが必要です。" };
    }

    const result = await createMemo(session.user.id, draft);

    if (result.error || !result.memo) {
      return { error: result.error ?? "メモの保存に失敗しました。" };
    }

    setMemos((current) => [result.memo, ...current]);
    applyNavigationState({ memoId: result.memo.id, route: "detail" });
    return {};
  };

  const editMemo = async (draft: MemoDraft) => {
    if (!session) {
      return { error: "ログインが必要です。" };
    }

    if (!selectedMemo) {
      return { error: "編集するメモが見つかりません。" };
    }

    const result = await updateMemo(session.user.id, selectedMemo.id, draft);

    if (result.error || !result.memo) {
      return { error: result.error ?? "メモの更新に失敗しました。" };
    }

    setMemos((current) => sortMemos(current.map((memo) => (memo.id === result.memo.id ? result.memo : memo))));
    applyNavigationState({ memoId: result.memo.id, route: "detail" });
    return {};
  };

  const removeMemo = async () => {
    if (!session) {
      return { error: "ログインが必要です。" };
    }

    if (!selectedMemo) {
      return { error: "削除するメモが見つかりません。" };
    }

    const result = await deleteMemoFromSupabase(session.user.id, selectedMemo.id);

    if (result.error) {
      return { error: result.error };
    }

    const nextMemos = memos.filter((memo) => memo.id !== selectedMemo.id);
    setMemos(nextMemos);
    applyNavigationState({ memoId: nextMemos[0]?.id ?? "", route: "list" });
    return {};
  };

  const loadPeople = async (userId: string) => {
    setPeopleLoading(true);
    setPeopleError(null);

    const result = await fetchPeople(userId);

    if (result.error) {
      setPeopleError(result.error);
    } else {
      setPeople(result.people);
      setSelectedPersonId((current) => (current && result.people.some((person) => person.id === current) ? current : result.people[0]?.id ?? ""));
    }

    setPeopleLoading(false);
  };

  const loadConversationNotes = async (userId: string, personId: string) => {
    setConversationNotesLoading(true);
    setConversationNotesError(null);

    const result = await fetchConversationNotes(userId, personId);

    if (result.error) {
      setConversationNotesError(result.error);
      setConversationNotes([]);
    } else {
      setConversationNotes(result.conversationNotes);
      setSelectedConversationNoteId((current) =>
        current && result.conversationNotes.some((conversationNote) => conversationNote.id === current) ? current : ""
      );
    }

    setConversationNotesLoading(false);
  };

  const addPerson = async (draft: PersonDraft) => {
    if (!session) {
      return { error: "ログインが必要です。" };
    }

    const result = await createPerson(session.user.id, draft);

    if (result.error || !result.person) {
      return { error: result.error ?? "人物プロフィールの保存に失敗しました。" };
    }

    setPeople((current) => [result.person, ...current]);
    setConversationNotes([]);
    setConversationNotesError(null);
    applyNavigationState({ conversationNoteId: "", personId: result.person.id, route: "personDetail" });
    return {};
  };

  const editPerson = async (draft: PersonDraft) => {
    if (!session) {
      return { error: "ログインが必要です。" };
    }

    if (!selectedPerson) {
      return { error: "編集する人物プロフィールが見つかりません。" };
    }

    const result = await updatePerson(session.user.id, selectedPerson.id, draft);

    if (result.error || !result.person) {
      return { error: result.error ?? "人物プロフィールの更新に失敗しました。" };
    }

    setPeople((current) => current.map((person) => (person.id === result.person.id ? result.person : person)));
    applyNavigationState({ personId: result.person.id, route: "personDetail" });
    return {};
  };

  const removePerson = async () => {
    if (!session) {
      return { error: "ログインが必要です。" };
    }

    if (!selectedPerson) {
      return { error: "削除する人物プロフィールが見つかりません。" };
    }

    const result = await deletePersonFromSupabase(session.user.id, selectedPerson.id);

    if (result.error) {
      return { error: result.error };
    }

    const nextPeople = people.filter((person) => person.id !== selectedPerson.id);
    setPeople(nextPeople);
    setConversationNotes([]);
    setConversationNotesError(null);
    setConversationNotesLoading(false);
    applyNavigationState({ conversationNoteId: "", personId: nextPeople[0]?.id ?? "", route: "people" });
    return {};
  };

  const addConversationNote = async (draft: ConversationNoteDraft) => {
    if (!session) {
      return { error: "ログインが必要です。" };
    }

    const result = await createConversationNote(session.user.id, draft);

    if (result.error || !result.conversationNote) {
      return { error: result.error ?? "会話メモの保存に失敗しました。" };
    }

    setConversationNotes((current) => sortConversationNotes([result.conversationNote, ...current]));
    applyNavigationState({ conversationNoteId: result.conversationNote.id, personId: result.conversationNote.personId, route: "personDetail" });
    return {};
  };

  const editConversationNote = async (draft: ConversationNoteDraft) => {
    if (!session) {
      return { error: "ログインが必要です。" };
    }

    if (!selectedPerson || !selectedConversationNote) {
      return { error: "編集する会話メモが見つかりません。" };
    }

    const result = await updateConversationNote(session.user.id, selectedPerson.id, selectedConversationNote.id, draft);

    if (result.error || !result.conversationNote) {
      return { error: result.error ?? "会話メモの更新に失敗しました。" };
    }

    setConversationNotes((current) =>
      sortConversationNotes(current.map((conversationNote) => (conversationNote.id === result.conversationNote.id ? result.conversationNote : conversationNote)))
    );
    applyNavigationState({ conversationNoteId: result.conversationNote.id, personId: result.conversationNote.personId, route: "personDetail" });
    return {};
  };

  const removeConversationNote = async (conversationNoteId: string) => {
    if (!session) {
      return { error: "ログインが必要です。" };
    }

    if (!selectedPerson) {
      return { error: "人物プロフィールが見つかりません。" };
    }

    const result = await deleteConversationNoteFromSupabase(session.user.id, selectedPerson.id, conversationNoteId);

    if (result.error) {
      return { error: result.error };
    }

    applyNavigationState({ conversationNoteId: "", personId: selectedPerson.id, route: "personDetail" });
    await loadConversationNotes(session.user.id, selectedPerson.id);
    return {};
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { error: error.message };
    }

    if (!data.session) {
      return { message: "確認メールを送信しました。メール内のリンクを開いて登録を完了してください。" };
    }

    return { message: "登録しました。" };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);
    }
  };

  const changeWeekStart = async (nextWeekStart: WeekStart) => {
    setWeekStart(nextWeekStart);
    try {
      await saveWeekStart(nextWeekStart);
    } catch {
      // 端末保存に失敗しても、現在の画面では選択状態を維持します。
    }
  };

  const renderScreen = () => {
    if (!session || route === "login") {
      return <LoginScreen onSignIn={signIn} onSignUp={signUp} />;
    }

    switch (route) {
      case "home":
        return <HomeScreen memos={memos} onNavigate={navigate} onOpenMemo={openMemo} />;
      case "create":
        return <MemoFormScreen people={people} onSave={addMemo} onCancel={() => navigate("home")} />;
      case "edit":
        return selectedMemo ? (
          <MemoFormScreen
            initialMemo={selectedMemo}
            onCancel={() => navigate("detail")}
            onSave={editMemo}
            people={people}
            submitLabel="更新"
            subtitle="残したメモを今の言葉に整えます。"
            title="メモ編集"
          />
        ) : (
          <MemoListScreen
            error={memosError}
            loading={memosLoading}
            memos={memos}
            onOpenMemo={openMemo}
            onRetry={() => {
              if (session) {
                void loadMemos(session.user.id);
              }
            }}
          />
        );
      case "list":
        return (
          <MemoListScreen
            error={memosError}
            loading={memosLoading}
            memos={memos}
            onOpenMemo={openMemo}
            onRetry={() => {
              if (session) {
                void loadMemos(session.user.id);
              }
            }}
          />
        );
      case "detail":
        return selectedMemo ? (
          <MemoDetailScreen
            memo={selectedMemo}
            onBack={() => navigate("list")}
            onCreate={() => navigate("create")}
            onDelete={removeMemo}
            onEdit={() => navigate("edit")}
            people={people}
          />
        ) : (
          <MemoListScreen
            error={memosError}
            loading={memosLoading}
            memos={memos}
            onOpenMemo={openMemo}
            onRetry={() => {
              if (session) {
                void loadMemos(session.user.id);
              }
            }}
          />
        );
      case "reflection":
        return <ReflectionScreen memos={memos} onOpenMemo={openMemo} weekStart={weekStart} />;
      case "people":
        return (
          <PeopleListScreen
            error={peopleError}
            loading={peopleLoading}
            onCreate={() => navigate("personCreate")}
            onOpenPerson={openPerson}
            onRetry={() => {
              if (session) {
                void loadPeople(session.user.id);
              }
            }}
            people={people}
          />
        );
      case "personCreate":
        return <PersonFormScreen onCancel={() => navigate("people")} onSave={addPerson} />;
      case "personEdit":
        return selectedPerson ? (
          <PersonFormScreen
            initialPerson={selectedPerson}
            onCancel={() => navigate("personDetail")}
            onSave={editPerson}
            submitLabel="更新"
            subtitle="その人の基本プロフィールを、今わかっている形に整えます。"
            title="人物プロフィール編集"
          />
        ) : (
          <PeopleListScreen
            error={peopleError}
            loading={peopleLoading}
            onCreate={() => navigate("personCreate")}
            onOpenPerson={openPerson}
            onRetry={() => {
              if (session) {
                void loadPeople(session.user.id);
              }
            }}
            people={people}
          />
        );
      case "personDetail":
        return selectedPerson ? (
          <PersonDetailScreen
            conversationNotes={conversationNotes}
            conversationNotesError={conversationNotesError}
            conversationNotesLoading={conversationNotesLoading}
            onAddConversationNote={() => navigate("conversationCreate")}
            onBack={() => navigate("people")}
            onCreate={() => navigate("personCreate")}
            onDelete={removePerson}
            onDeleteConversationNote={removeConversationNote}
            onEdit={() => navigate("personEdit")}
            onEditConversationNote={(conversationNoteId) => {
              applyNavigationState({ conversationNoteId, personId: selectedPerson.id, route: "conversationEdit" });
            }}
            onRetryConversationNotes={() => {
              if (session && selectedPerson) {
                void loadConversationNotes(session.user.id, selectedPerson.id);
              }
            }}
            person={selectedPerson}
            strengthFeedbackMemos={memos.filter((memo) => memo.strengthFeedbackPersonId === selectedPerson.id && memo.strengthFeedback.trim())}
          />
        ) : (
          <PeopleListScreen
            error={peopleError}
            loading={peopleLoading}
            onCreate={() => navigate("personCreate")}
            onOpenPerson={openPerson}
            onRetry={() => {
              if (session) {
                void loadPeople(session.user.id);
              }
            }}
            people={people}
          />
        );
      case "conversationCreate":
        return selectedPerson ? (
          <ConversationNoteFormScreen person={selectedPerson} onCancel={() => navigate("personDetail")} onSave={addConversationNote} />
        ) : (
          <PeopleListScreen
            error={peopleError}
            loading={peopleLoading}
            onCreate={() => navigate("personCreate")}
            onOpenPerson={openPerson}
            onRetry={() => {
              if (session) {
                void loadPeople(session.user.id);
              }
            }}
            people={people}
          />
        );
      case "conversationEdit":
        return selectedPerson && selectedConversationNote ? (
          <ConversationNoteFormScreen
            initialConversationNote={selectedConversationNote}
            person={selectedPerson}
            onCancel={() => navigate("personDetail")}
            onSave={editConversationNote}
            submitLabel="更新"
            subtitle={`${selectedPerson.name}さんとの会話メモを整えます。`}
            title="会話メモ編集"
          />
        ) : (
          <PeopleListScreen
            error={peopleError}
            loading={peopleLoading}
            onCreate={() => navigate("personCreate")}
            onOpenPerson={openPerson}
            onRetry={() => {
              if (session) {
                void loadPeople(session.user.id);
              }
            }}
            people={people}
          />
        );
      case "settings":
        return <SettingsScreen onLogout={logout} onWeekStartChange={changeWeekStart} userEmail={session.user.email} weekStart={weekStart} />;
      default:
        return <HomeScreen memos={memos} onNavigate={navigate} onOpenMemo={openMemo} />;
    }
  };

  const activeRoute =
    route === "personCreate" || route === "personEdit" || route === "personDetail" || route === "conversationCreate" || route === "conversationEdit"
      ? "people"
      : mainRoutes.includes(route)
        ? route
        : "list";

  if (!fontsLoaded || authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accentDark} />
        {authError ? <Text style={styles.loadingError}>{authError}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      <View style={styles.screen}>{renderScreen()}</View>
      {session && route !== "login" ? <BottomNav activeRoute={activeRoute} onNavigate={navigate} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    flex: 1
  },
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: "center"
  },
  loadingError: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 24,
    textAlign: "center"
  }
});

function sortConversationNotes(notes: ConversationNote[]) {
  return [...notes].sort((a, b) => {
    const talkedAtOrder = b.talkedAt.localeCompare(a.talkedAt);

    if (talkedAtOrder !== 0) {
      return talkedAtOrder;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

function sortMemos(notes: Memo[]) {
  return [...notes].sort((a, b) => b.date.localeCompare(a.date));
}

function canUseBrowserHistory() {
  return Platform.OS === "web" && typeof window !== "undefined" && typeof window.history !== "undefined";
}

function readBrowserNavigationState(): BrowserNavigationState | null {
  if (!canUseBrowserHistory()) {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const route = params.get("screen") as AppRoute | null;

  if (!route || !allRoutes.includes(route)) {
    return null;
  }

  return {
    conversationNoteId: params.get("conversationNoteId") ?? undefined,
    memoId: params.get("memoId") ?? undefined,
    personId: params.get("personId") ?? undefined,
    route
  };
}

function writeBrowserNavigationState(state: BrowserNavigationState, mode: "push" | "replace" = "push") {
  if (!canUseBrowserHistory()) {
    return;
  }

  const params = new URLSearchParams();

  if (state.route !== "login") {
    params.set("screen", state.route);
  }

  if (state.memoId) {
    params.set("memoId", state.memoId);
  }

  if (state.personId) {
    params.set("personId", state.personId);
  }

  if (state.conversationNoteId) {
    params.set("conversationNoteId", state.conversationNoteId);
  }

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (nextUrl === currentUrl) {
    return;
  }

  if (mode === "replace") {
    window.history.replaceState(state, "", nextUrl);
    return;
  }

  window.history.pushState(state, "", nextUrl);
}
