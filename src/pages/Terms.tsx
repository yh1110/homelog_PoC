import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateUserProfile } from "@/hooks/useUserProfile";
import TermsContent from "@/components/TermsContent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/UseAuth";

const Terms = () => {
  const navigate = useNavigate();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const updateProfileMutation = useUpdateUserProfile();
  const [hasReadTerms, setHasReadTerms] = useState(false);

  // 既に同意済みの場合はリダイレクト
  useEffect(() => {
    if (userProfile?.terms_accepted) {
      navigate("/", { replace: true });
    }
  }, [userProfile, navigate]);

  const handleAccept = async () => {
    if (!user) {
      toast.error("ログインが必要です");
      return;
    }

    if (!hasReadTerms) {
      toast.error("利用規約を確認してください");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        updates: {
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        },
      });

      // プロファイルを再取得
      await refreshUserProfile();

      toast.success("利用規約に同意しました");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Terms acceptance error:", error);
      toast.error("エラーが発生しました。もう一度お試しください。");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">テスト利用に関する同意事項</CardTitle>
          <CardDescription>
            本アプリをご利用いただくには、テスト利用に関する同意事項への同意が必要です。
            <br />
            内容をよくお読みいただき、同意いただける場合はチェックボックスをチェックしてください。
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* スクロール可能な利用規約本文 */}
          <div className="h-[400px] overflow-y-auto border rounded-lg p-6 bg-muted/30 mb-6">
            <TermsContent />
          </div>

          {/* 同意チェックボックス */}
          <div className="flex items-start space-x-3 mb-6">
            <Checkbox
              id="terms"
              checked={hasReadTerms}
              onCheckedChange={(checked) => setHasReadTerms(checked === true)}
              className="mt-1"
            />
            <label
              htmlFor="terms"
              className="text-sm leading-relaxed text-foreground cursor-pointer"
            >
              上記のテスト利用に関する同意事項を読み、内容に同意します
            </label>
          </div>

          {/* 同意ボタン */}
          <Button
            onClick={handleAccept}
            disabled={!hasReadTerms || updateProfileMutation.isPending}
            className="w-full"
            size="lg"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                処理中...
              </>
            ) : (
              "同意して利用を開始する"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;
