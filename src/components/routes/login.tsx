import { Button } from "@/components/ui/button";
import { useState } from "react";
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
import { useDatabase } from "@/components/DatabaseProvider";
import { login } from "@/auth";
import type { UserDocType } from "@/types/schemas";

const colors = ["#E53E3E", "#38A169", "#3182CE", "#805AD5", "#D53F8C"];

export function LoginForm() {
  const db = useDatabase();
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username) return;
    setError(null);
    const user = await db.users
      .findOne({
        selector: {
          username: username,
        },
      })
      .exec();

    if (user) {
      console.log("User found:", user.toJSON());
      await login(user.toJSON());
    } else {
      setError("User not found. Would you like to join?");
    }
  };

  const handleJoin = async () => {
    if (!username) return;
    if (!selectedColor) {
      setError("Please select a color.");
      return;
    }
    setError(null);

    const existingUser = await db.users
      .findOne({
        selector: {
          username: username,
        },
      })
      .exec();

    if (existingUser) {
      setError("Username is already taken.");
      return;
    }

    try {
      const newUser: UserDocType = {
        userId: crypto.randomUUID(),
        username,
        userColor: selectedColor,
      };
      const user = await db.users.insert(newUser);
      await login(user.toJSON());
    } catch (error) {
      setError("An unexpected error occurred while creating the user.");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login or Join</CardTitle>
        <CardDescription>
          Enter your username to sign in or create a new account.
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
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
        <div className="grid gap-2">
          <Label>Choose a color</Label>
          <div className="flex gap-2 pt-1">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setSelectedColor(color);
                  setError(null);
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
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button type="button" className="w-full" onClick={handleLogin}>
          Sign in
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleJoin}
        >
          Join
        </Button>
      </CardFooter>
    </Card>
  );
}
