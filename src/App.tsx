import React from 'react';
import './App.css';
import Navigation from './Router'
import model from "./models";
import { StoreProvider, createStore } from "easy-peasy";
require('dotenv').config()

const store = createStore(model);

const App: React.FC = () => {
  return (
    <StoreProvider store={store}>
      <div className="App">
        <Navigation/>
      </div>
    </StoreProvider>
  );
}

export default App;
