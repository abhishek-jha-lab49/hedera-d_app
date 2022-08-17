// import logo from './logo.svg';
import './App.css';
import { connectToWallet, getBalance, sendTransaction, getPhoneNumber } from './hashconnect';

function App() {
  return (
    <div className="App">
      <button onClick={connectToWallet}>Connect to Wallet</button>

      <button onClick={sendTransaction}>Send</button>

      <button onClick={getBalance}>Balance</button>

      <button onClick={getPhoneNumber}>Phone Number</button>
    </div>
  );
}

export default App;
