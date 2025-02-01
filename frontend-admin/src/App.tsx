import Router from "./components/routers/router";
import AuthProvider from "./components/auth/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
