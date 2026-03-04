import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Checkbox } from "./components/ui/checkbox";

function App() {
  return (
    <>
      <Button>My Button</Button>
      <Input placeholder="Enter your name" />
      <Checkbox />
    </>
  );
}

export default App;
