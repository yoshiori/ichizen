import React, {useState, useEffect} from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator} from "react-native";
import {useTranslation} from "react-i18next";
import {useAuth} from "../contexts/AuthContext";
import {followUser, unfollowUser, getFollowing, isFollowing, getUser} from "../services/firestore";
import {getUserIdByUsername} from "../utils/username";
import {formatDateByLanguage} from "../utils/dateFormat";
import {Follow, User} from "../types/firebase";

interface FollowingUser {
  follow: Follow;
  user: User | null;
}

export const FollowScreen: React.FC = () => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [followingId, setFollowingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFollowing = async () => {
    if (!user) return;

    try {
      setRefreshing(true);
      const follows = await getFollowing(user.id);

      // Get user details for each follow
      const followingWithUsers = await Promise.all(
        follows.map(async (follow) => {
          const userData = await getUser(follow.followingId);
          return {follow, user: userData};
        })
      );

      setFollowingUsers(followingWithUsers);
    } catch (error) {
      console.error("Error loading following:", error);
      Alert.alert(t("follow.error", "エラー"), t("follow.loadError", "フォロー一覧の読み込みに失敗しました"));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFollowing();
  }, [user]);

  const handleFollow = async () => {
    if (!user || !followingId.trim()) return;

    // Check if trying to follow self by username
    if (followingId === user.username) {
      Alert.alert(t("follow.error", "エラー"), t("follow.selfFollowError", "自分をフォローすることはできません"));
      return;
    }

    try {
      setLoading(true);

      // Convert username to user ID
      const targetUserId = await getUserIdByUsername(followingId);
      if (!targetUserId) {
        Alert.alert(t("follow.error", "エラー"), t("follow.userNotFound", "ユーザーが見つかりません"));
        return;
      }

      // Check if user exists
      const targetUser = await getUser(targetUserId);
      if (!targetUser) {
        Alert.alert(t("follow.error", "エラー"), t("follow.userNotFound", "ユーザーが見つかりません"));
        return;
      }

      // Check if already following
      const alreadyFollowing = await isFollowing(user.id, targetUserId);
      if (alreadyFollowing) {
        Alert.alert(t("follow.error", "エラー"), t("follow.alreadyFollowing", "すでにフォローしています"));
        return;
      }

      await followUser(user.id, targetUserId);

      Alert.alert(t("follow.success", "成功"), t("follow.followSuccess", "ユーザーをフォローしました"));

      setFollowingId("");
      loadFollowing();
    } catch (error) {
      console.error("Follow error:", error);
      Alert.alert(t("follow.error", "エラー"), t("follow.followError", "フォローに失敗しました"));
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (followingUserId: string) => {
    if (!user) return;

    Alert.alert(
      t("follow.confirmUnfollow", "フォロー解除"),
      t("follow.confirmUnfollowMessage", "このユーザーのフォローを解除しますか？"),
      [
        {
          text: t("common.cancel", "キャンセル"),
          style: "cancel",
        },
        {
          text: t("follow.unfollow", "フォロー解除"),
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await unfollowUser(user.id, followingUserId);
              loadFollowing();
            } catch (error) {
              console.error("Unfollow error:", error);
              Alert.alert(t("follow.error", "エラー"), t("follow.unfollowError", "フォロー解除に失敗しました"));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t("follow.authRequired", "ログインが必要です")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t("follow.fullTitle", "フォロー管理")}</Text>

        {/* Your Username Display */}
        <View style={styles.userIdSection}>
          <Text style={styles.sectionTitle}>{t("follow.yourId", "あなたのユーザーID")}</Text>
          <View style={styles.userIdContainer}>
            <Text style={styles.userId}>{user.username}</Text>
          </View>
          <Text style={styles.userIdHint}>
            {t("follow.shareUsernameHint", "このユーザー名を友達に共有してフォローしてもらいましょう")}
          </Text>
        </View>

        {/* Follow User Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("follow.followUser", "ユーザーをフォロー")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("follow.enterUsername", "ユーザー名を入力")}
            value={followingId}
            onChangeText={setFollowingId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.followButton, (!followingId.trim() || loading) && styles.buttonDisabled]}
            onPress={handleFollow}
            disabled={!followingId.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" testID="activity-indicator" />
            ) : (
              <Text style={styles.buttonText}>{t("follow.follow", "フォローする")}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Following List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("follow.following", "フォロー中")} ({followingUsers.length})
          </Text>

          {refreshing ? (
            <ActivityIndicator style={styles.loading} />
          ) : followingUsers.length === 0 ? (
            <Text style={styles.emptyText}>{t("follow.noFollowing", "フォロー中のユーザーはいません")}</Text>
          ) : (
            followingUsers.map(({follow, user: followingUser}) => (
              <View key={follow.id} style={styles.followItem}>
                <View style={styles.followInfo}>
                  <Text style={styles.followUserId}>{followingUser?.username || "Unknown User"}</Text>
                  {followingUser && (
                    <Text style={styles.followDate}>
                      {t("follow.followedAt", "フォロー開始")}:{" "}
                      {formatDateByLanguage(new Date(follow.createdAt), user?.language || "ja")}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.unfollowButton}
                  onPress={() => handleUnfollow(follow.followingId)}
                  disabled={loading}
                >
                  <Text style={styles.unfollowButtonText}>{t("follow.unfollow", "フォロー解除")}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  userIdSection: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userIdContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  userId: {
    fontSize: 16,
    fontFamily: "monospace",
    color: "#333",
    textAlign: "center",
  },
  userIdHint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#ffffff",
    marginBottom: 15,
  },
  followButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loading: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginVertical: 20,
  },
  followItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  followInfo: {
    flex: 1,
  },
  followUserId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    fontFamily: "monospace",
  },
  followDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  unfollowButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unfollowButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    textAlign: "center",
    color: "#ff4444",
    fontSize: 16,
    marginTop: 50,
  },
});
