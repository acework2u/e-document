import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./assets/styles/styles.css";

import Auth from "./routes/Auth";
import Documents from "./routes/Documents";
import Files from "./routes/Files";
import Admin from "./routes/Admin";
import PageNotFound from "./routes/PageNotFound";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Documents page="document" />} />
        <Route path="/files" element={<Files page="files" />} />
        <Route path="/admin" element={<Admin page="admin" />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
