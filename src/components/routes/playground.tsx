import useAuth from "@/hooks/useAuth";

export default function Playground() {
  const { currentUser, logout } = useAuth();
  return (
    <div>
      hello, world!
      <br />
      currenUser: {currentUser?.username}
      <br />
      <button
        onClick={() => {
          logout();
        }}
      >
        Logout
      </button>
    </div>
  );
}
