"use client";
import Login from "./Login";
import { useState } from "react";

const LandingPage = () => {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <div>LandingPage</div>
      <button onClick={() => setOpenDialog(true)}>Login</button>
      <Login openDialog={openDialog} closeDialog={() => setOpenDialog(false)} />
    </>
  );
};

export default LandingPage;
