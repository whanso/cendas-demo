import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuth from "@/hooks/useAuth";

const colors = ["#E53E3E", "#38A169", "#3182CE", "#805AD5", "#D53F8C"];

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const { isProcessing, error, enrollUser, loginUser, clearError } = useAuth();
  const [showJoinOptions, setShowJoinOptions] = useState(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setFormError(null);
    clearError();
  };

  const handleLogin = async () => {
    if (!username || isProcessing) return;
    setFormError(null);
    loginUser(username);
  };

  const handleJoin = async () => {
    if (!username || isProcessing) return;
    setFormError(null);

      if (!selectedColor) {
        setFormError("Please select a color to join.");
        return;
      }
      enrollUser({
        username,
        userColor: selectedColor,
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (showJoinOptions) {
        handleJoin();
      } else {
        handleLogin();
      }
    }
  };

  const handleGoBack = () => {
    setShowJoinOptions(false);
    setFormError(null);
    setSelectedColor("");
    clearError();
  };

  const switchToJoinView = () => {
    setShowJoinOptions(true);
    setFormError(null);
    clearError();
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {showJoinOptions ? "Join" : "Login"}
          </CardTitle>
          {showJoinOptions && (
            <Button
              variant="link"
              onClick={handleGoBack}
              className="p-0 h-auto"
            >
              Go Back
            </Button>
          )}
        </div>
        <CardDescription>
          {showJoinOptions
            ? `Create a new account by providing a username and selecting a color.`
            : "Enter your username to sign in."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            required
            value={username}
            onChange={handleUsernameChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        {showJoinOptions && (
          <div className="grid gap-2">
            <Label>Choose a color</Label>
            <div className="flex gap-2 pt-1">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    setFormError(null);
                  }}
                  className={`w-8 h-8 rounded-full border-2 border-input transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-ring ring-offset-2"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}
        {(formError || error) && (
          <p className="text-sm text-red-500">{formError || error?.message}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {showJoinOptions ? (
          <Button
            type="button"
            className="w-full"
            onClick={handleJoin}
            disabled={!!isProcessing}
          >
            {isProcessing === "join" ? "Joining..." : "Join"}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              className="w-full"
              onClick={handleLogin}
              disabled={!!isProcessing}
            >
              {isProcessing === "login" ? "Signing in..." : "Sign in"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={switchToJoinView}
              disabled={!!isProcessing}
            >
              Join
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
